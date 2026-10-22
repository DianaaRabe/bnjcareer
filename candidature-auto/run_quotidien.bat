@echo off
REM Sourcing quotidien des offres Data Analyst + preparation du lot.
REM Aucune candidature n'est envoyee par ce script : il prepare uniquement.
cd /d "E:\BNJ All in One\candidature-auto"
if not exist logs mkdir logs
python run_daily.py >> logs\run.log 2>&1
python preparer_lot.py >> logs\run.log 2>&1
echo. >> logs\run.log
