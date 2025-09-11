-- Script SQL per svuotare la tabella wallet
-- Questo rimuoverà tutti i pronostici copiati dagli utenti
-- ATTENZIONE: Questa operazione è irreversibile!

-- Disabilita temporaneamente i trigger per evitare problemi
SET session_replication_role = replica;

-- Svuota completamente la tabella wallet
DELETE FROM wallet;

-- Riabilita i trigger
SET session_replication_role = DEFAULT;

-- Verifica che la tabella sia vuota
SELECT COUNT(*) as remaining_records FROM wallet;

-- Commento finale
-- La tabella wallet è stata svuotata completamente
-- Tutti i pronostici copiati dagli utenti sono stati rimossi