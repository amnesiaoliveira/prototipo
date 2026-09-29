@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado neste computador.
  echo Abra index.html diretamente para experimentar o prototipo.
  pause
  exit /b 1
)
echo Iniciando o prototipo local na porta 4178...
start "Prototipo - Protocolo Municipal" cmd /k node "%~dp0server.cjs" 4178
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4178"
echo Para encerrar, pressione Ctrl+C na janela do servidor e feche a janela.
endlocal
