"""
publisher.py — FTP upload a publikace

Funkce:
1. FTP připojení a upload
2. Správa adresářů a chmod
3. Dry-run podpora
"""

import os
from ftplib import FTP, error_perm
from typing import List

from config import (
    FTP_HOST, FTP_USER, FTP_PASS, FTP_TARGET_DIR,
    CHMOD_DIR, CHMOD_FILE, DRY_RUN,
    OUT_DIR, ARCHIVE_SUBDIR,
)
from helpers import now_str


# =====================================================
# FTP HELPERS
# =====================================================
def ftp_try_chmod(ftp: FTP, mode: str, path_or_name: str) -> None:
    """Pokusí se nastavit chmod, ignoruje chyby."""
    try:
        ftp.sendcmd(f"SITE CHMOD {mode} {path_or_name}")
    except Exception:
        pass


def ftp_mkdir_p(ftp: FTP, path: str) -> None:
    """Rekurzivně vytvoří adresář na FTP."""
    parts = [p for p in path.split("/") if p]
    cur = ""
    
    for p in parts:
        cur += "/" + p
        try:
            ftp.cwd(cur)
        except error_perm:
            try:
                ftp.mkd(cur)
                ftp_try_chmod(ftp, CHMOD_DIR, cur)
            except error_perm:
                pass  # Adresář možná již existuje


# =====================================================
# FTP UPLOAD
# =====================================================
def ftp_upload(local_paths: List[str]) -> None:
    """
    Nahraje soubory na FTP server.
    
    Args:
        local_paths: Seznam lokálních cest k nahrání
    
    Raises:
        RuntimeError: Pokud chybí FTP přihlašovací údaje
    """
    if DRY_RUN:
        print(f"[{now_str()}] DRY-RUN: Přeskakuji FTP upload ({len(local_paths)} souborů)")
        for p in local_paths:
            print(f"  - {os.path.relpath(p, OUT_DIR)}")
        return
    
    if not FTP_HOST or not FTP_USER or not FTP_PASS:
        raise RuntimeError("Chybí FTP_HOST/FTP_USER/FTP_PASS v .env")
    
    print(f"[{now_str()}] FTP: Připojování k {FTP_HOST}...")
    
    ftp = FTP()
    ftp.connect(FTP_HOST, 21, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    
    # Zajistit existenci cílových adresářů
    ftp_mkdir_p(ftp, FTP_TARGET_DIR)
    ftp_try_chmod(ftp, CHMOD_DIR, FTP_TARGET_DIR)
    
    ftp_mkdir_p(ftp, f"{FTP_TARGET_DIR}/{ARCHIVE_SUBDIR}")
    ftp_try_chmod(ftp, CHMOD_DIR, f"{FTP_TARGET_DIR}/{ARCHIVE_SUBDIR}")
    
    uploaded = 0
    failed = 0
    
    for p in local_paths:
        try:
            rel = os.path.relpath(p, OUT_DIR).replace("\\", "/")
            remote_full = f"{FTP_TARGET_DIR}/{rel}"
            remote_dir = os.path.dirname(remote_full).replace("\\", "/")
            
            ftp_mkdir_p(ftp, remote_dir)
            ftp.cwd(remote_dir)
            
            remote_name = os.path.basename(remote_full)
            
            with open(p, "rb") as f:
                ftp.storbinary(f"STOR {remote_name}", f)
            
            ftp_try_chmod(ftp, CHMOD_FILE, remote_name)
            uploaded += 1
            
        except Exception as e:
            print(f"[{now_str()}] FTP chyba při uploadu {p}: {e}")
            failed += 1
    
    ftp.quit()
    
    print(f"[{now_str()}] FTP: hotovo | nahráno={uploaded}, chyb={failed}")


# =====================================================
# LOCAL FILE OPERATIONS
# =====================================================
def move_to_archive(
    src_path: str,
    dst_path: str,
) -> bool:
    """
    Přesune soubor do archivu.
    
    Returns:
        True pokud byl soubor přesunut
    """
    if not os.path.exists(src_path):
        return False
    
    if os.path.exists(dst_path):
        return False
    
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    os.replace(src_path, dst_path)
    
    return True


def get_files_for_upload(new_files: List[str]) -> List[str]:
    """
    Vrátí seznam souborů k nahrání (deduplikovaný a seřazený).
    """
    return sorted(list(set(new_files)))
