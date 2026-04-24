#!/usr/bin/env python3
"""
deploy_wedos.py — Nahraje statický web na Wedos FTP (spolehlivá verze s retry)
"""
import ftplib
import os
import time

HOST       = '323599.w99.wedos.net'
USER       = 'w323599_4'
PASS       = 'gHRNM7ue'
REMOTE_BASE = '/domains/benzinmapa.cz'
LOCAL_BASE  = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'web', 'out'))

# Soubory které přeskočíme (Next.js interní indexy)
SKIP_NAMES = {'__next.__PAGE__.txt', '__next._full.txt', '__next._head.txt',
               '__next._index.txt', '__next._tree.txt', '__next.rsc'}


def new_conn():
    ftp = ftplib.FTP(timeout=45)
    ftp.connect(HOST, 21)
    ftp.login(USER, PASS)
    ftp.set_pasv(True)
    return ftp


def ensure_dir(ftp, path):
    try:
        ftp.mkd(path)
    except ftplib.error_perm:
        pass  # already exists


def upload_file(ftp, local_path: str, remote_path: str, retries=3) -> bool:
    for attempt in range(retries):
        try:
            with open(local_path, 'rb') as f:
                ftp.storbinary('STOR ' + remote_path, f)
            return True
        except (ftplib.Error, OSError, ConnectionResetError) as e:
            if attempt < retries - 1:
                time.sleep(1.5 ** attempt)
                try:
                    ftp.quit()
                except Exception:
                    pass
                ftp.__dict__.update(new_conn().__dict__)
            else:
                print(f'  CHYBA po {retries} pokusech: {remote_path}: {e}')
    return False


def upload_all():
    if not os.path.exists(LOCAL_BASE):
        print(f'CHYBA: {LOCAL_BASE} neexistuje – spusť nejdřív: cd web && npm run build')
        return 0, 1

    ftp = new_conn()
    uploaded = skipped = errors = 0
    total = sum(
        len([f for f in files if f not in SKIP_NAMES])
        for _, _, files in os.walk(LOCAL_BASE)
    )
    print(f'Nahrávám {total} souborů na {HOST}{REMOTE_BASE}...')

    for root, dirs, files in os.walk(LOCAL_BASE):
        rel = os.path.relpath(root, LOCAL_BASE).replace(os.sep, '/')
        remote_dir = REMOTE_BASE if rel == '.' else f'{REMOTE_BASE}/{rel}'
        ensure_dir(ftp, remote_dir)

        for fname in files:
            if fname in SKIP_NAMES:
                skipped += 1
                continue
            local_path  = os.path.join(root, fname)
            remote_path = f'{remote_dir}/{fname}'
            if upload_file(ftp, local_path, remote_path):
                uploaded += 1
                if uploaded % 50 == 0:
                    pct = int(uploaded / total * 100)
                    print(f'  {pct}% – {uploaded}/{total} souborů...')
            else:
                errors += 1

    try:
        ftp.quit()
    except Exception:
        pass
    return uploaded, errors


if __name__ == '__main__':
    t0 = time.time()
    n, err = upload_all()
    elapsed = int(time.time() - t0)
    print(f'\nHotovo za {elapsed}s – nahráno: {n}, chyby: {err}')
    if err == 0:
        print('Web je live na http://323599.w99.wedos.net (nebo https://benzinmapa.cz po DNS)')
