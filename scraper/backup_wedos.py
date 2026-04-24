#!/usr/bin/env python3
"""
backup_wedos.py — Stáhne celý Wedos FTP server jako zálohu
"""
import ftplib, os, time, zipfile, datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

HOST  = '323599.w99.wedos.net'
USER  = 'w323599_4'
PASS  = 'gHRNM7ue'
BACKUP_DIR = os.path.expanduser('~/Desktop')
WORKERS = 6

SKIP_DIRS = {'.git', '__pycache__'}
# Nepřidávejme obrovske node_modules nebo .next z případných wp deployů
SKIP_IF_LARGE = {'wp-content/uploads'}  # přeskočit velké složky

def new_conn():
    for _ in range(4):
        try:
            ftp = ftplib.FTP(timeout=30)
            ftp.connect(HOST, 21)
            ftp.login(USER, PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception:
            time.sleep(2)
    raise RuntimeError('FTP nelze připojit')

def list_dir(ftp, path):
    entries = []
    try:
        ftp.cwd(path)
        raw = []
        ftp.retrlines('LIST', raw.append)
        for line in raw:
            parts = line.split(None, 8)
            if len(parts) < 9:
                continue
            perms = parts[0]
            name  = parts[8]
            if name in ('.', '..'):
                continue
            is_dir = perms.startswith('d')
            entries.append((name, is_dir))
    except Exception as e:
        print(f'  LIST chyba {path}: {e}')
    return entries

def collect_files(ftp, remote_path='/', depth=0):
    """Rekurzivně projde FTP a vrátí seznam (remote_path, size) souborů."""
    files = []
    entries = list_dir(ftp, remote_path)
    for name, is_dir in entries:
        full = remote_path.rstrip('/') + '/' + name
        skip_path = '/'.join(full.split('/')[-2:])
        if name in SKIP_DIRS or any(s in full for s in SKIP_IF_LARGE):
            print(f'  SKIP: {full}')
            continue
        if is_dir:
            files.extend(collect_files(ftp, full, depth + 1))
        else:
            files.append(full)
    return files

def download_file(args):
    remote_path, local_path = args
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    for attempt in range(3):
        ftp = None
        try:
            ftp = new_conn()
            with open(local_path, 'wb') as f:
                ftp.retrbinary('RETR ' + remote_path, f.write)
            ftp.quit()
            return True, remote_path
        except Exception as e:
            if ftp:
                try: ftp.quit()
                except: pass
            if attempt == 2:
                return False, f'{remote_path}: {e}'
            time.sleep(1.5 ** attempt)
    return False, remote_path

def main():
    ts = datetime.datetime.now().strftime('%Y%m%d_%H%M')
    tmp_dir = os.path.join(BACKUP_DIR, f'wedos_backup_{ts}')
    zip_path = os.path.join(BACKUP_DIR, f'wedos_ZALOHA_{ts}.zip')

    print(f'Připojuji se na {HOST}...')
    ftp = new_conn()
    print('Prochází adresáře...')
    remote_files = collect_files(ftp, '/')
    ftp.quit()

    total = len(remote_files)
    print(f'Nalezeno {total} souborů ke stažení')

    # Připrav úkoly
    tasks = []
    for rf in remote_files:
        lf = os.path.join(tmp_dir, rf.lstrip('/').replace('/', os.sep))
        tasks.append((rf, lf))

    # Paralelní stahování
    done = [0]
    errors = [0]
    t0 = time.time()

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(download_file, t): t for t in tasks}
        for fut in as_completed(futures):
            ok, info = fut.result()
            done[0] += 1
            if not ok:
                errors[0] += 1
                print(f'  CHYBA: {info}')
            if done[0] % 200 == 0:
                pct = done[0] / total * 100
                print(f'  {pct:.0f}% – {done[0]}/{total}')

    elapsed = int(time.time() - t0)
    print(f'Staženo za {elapsed}s – souborů: {done[0]}, chyb: {errors[0]}')

    # Zazipuj
    print(f'Zipuji do {zip_path}...')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=5) as zf:
        for root, _, files in os.walk(tmp_dir):
            for fname in files:
                fp = os.path.join(root, fname)
                arcname = os.path.relpath(fp, tmp_dir)
                zf.write(fp, arcname)

    # Smaz tmp
    import shutil
    shutil.rmtree(tmp_dir, ignore_errors=True)

    size_mb = os.path.getsize(zip_path) / 1024 / 1024
    print(f'Záloha: {zip_path} ({size_mb:.1f} MB)')

if __name__ == '__main__':
    main()
