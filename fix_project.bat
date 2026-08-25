@echo off
echo Восстановление структуры React Native проекта...
echo.

REM Создаем необходимые папки
mkdir android\gradle\wrapper 2>nul
mkdir android\app\src\main\assets 2>nul
mkdir android\app\src\main\res 2>nul

echo Структура папок создана.
echo.
pause