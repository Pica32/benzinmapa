#!/usr/bin/env python3
"""
deploy_parallel.py — Rychlý paralelní FTP upload s 8 spojeními
"""
import ftplib, os, time, threading
from concurrent.futures import ThreadPoolExecutor, as_completed

HOST        = '323599.w99.wedos.net'
USER        = 'w323599_4'
PASS        = 'gHRNM7ue'
REMOTE_BASE = '/domains/benzinmapa.cz'
LOCAL_BASE  = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'web', 'out'))
WORKERS     = 8   # paralelní FTP spojení
SKIP_NAMES  = {'__next.__PAGE__.txt','__next._full.txt','__next._head.txt',
                '__next._index.txt','__next._tree.txt','__next.rsc'}

_lock = threading.Lock()
_dirs_created = set()

def new_conn():
    for _ in range(5):
        try:
            ftp = ftplib.FTP(timeout=30)
            ftp.connect(HOST, 21)
            ftp.login(USER, PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception as e:
            time.sleep(2)
    raise RuntimeError(f"Nelze se připojit na FTP: {HOST}")

def ensure_dir(ftp, path):
    with _lock:
        if path in _dirs_created:
            return
    parts = path.replace(REMOTE_BASE, '').strip('/').split('/')
    current = REMOTE_BASE
    for part in parts:
        if not part:
            continue
        current = current + '/' + part
        with _lock:
            if current not in _dirs_created:
                try:
                    ftp.mkd(current)
                except ftplib.error_perm:
                    pass
                _dirs_created.add(current)

def upload_file(task):
    local_path, remote_path = task
    for attempt in range(3):
        ftp = None
        try:
            ftp = new_conn()
            remote_dir = '/'.join(remote_path.split('/')[:-1])
            ensure_dir(ftp, remote_dir)
            with open(local_path, 'rb') as f:
                ftp.storbinary('STOR ' + remote_path, f)
            ftp.quit()
            return True, remote_path
        except Exception as e:
            if ftp:
                try: ftp.quit()
                except: pass
            if attempt == 2:
                return False, f'CHYBA {remote_path}: {e}'
            time.sleep(1.5 ** attempt)
    return False, remote_path

def collect_tasks():
    tasks = []
    for root, dirs, files in os.walk(LOCAL_BASE):
        rel = os.path.relpath(root, LOCAL_BASE).replace(os.sep, '/')
        remote_dir = REMOTE_BASE if rel == '.' else f'{REMOTE_BASE}/{rel}'
        for fname in files:
            if fname in SKIP_NAMES:
                continue
            tasks.append((os.path.join(root, fname), f'{remote_dir}/{fname}'))
    return tasks

def main():
    if not os.path.exists(LOCAL_BASE):
        print(f'CHYBA: {LOCAL_BASE} neexistuje')
        return

    tasks = collect_tasks()
    total = len(tasks)
    print(f'Nahrávám {total} souborů ({WORKERS} paralelních spojení)...')

    done = [0]
    errors = [0]
    t0 = time.time()

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(upload_file, t): t for t in tasks}
        for fut in as_completed(futures):
            ok, info = fut.result()
            if ok:
                done[0] += 1
                if done[0] % 100 == 0:
                    elapsed = time.time() - t0
                    pct = done[0] / total * 100
                    speed = done[0] / elapsed if elapsed > 0 else 0
                    eta  = (total - done[0]) / speed if speed > 0 else 0
                    print(f'  {pct:.0f}% – {done[0]}/{total} | {speed:.0f} soub/s | ETA {int(eta)}s')
            else:
                errors[0] += 1
                print(f'  ! {info}')

    elapsed = int(time.time() - t0)
    print(f'\nHotovo za {elapsed}s – nahráno: {done[0]}, chyby: {errors[0]}')

if __name__ == '__main__':
    main()
