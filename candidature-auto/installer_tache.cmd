@echo off
REM Enregistre la tache planifiee quotidienne (lundi-vendredi, 08h00).
REM Desinstallation : schtasks /delete /tn "Candidatures Data Analyst" /f
schtasks /create ^
  /tn "Candidatures Data Analyst" ^
  /tr "\"E:\BNJ All in One\candidature-auto\run_quotidien.bat\"" ^
  /sc weekly ^
  /d MON,TUE,WED,THU,FRI ^
  /st 08:00 ^
  /f
