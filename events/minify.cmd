echo off
echo.
echo ############    HPA Minify Utility    ###############
echo.
echo.

set TARGET_FOLDER=src\webapp\app\common
IF "%1"=="" (
	goto exit

) else IF "%1"=="enyo" (
	echo.
	echo Minify process started - Enyo project  
	echo.
	goto enyo
)

IF NOT "%2"=="" (
	set TARGET_FOLDER=%2%
)


:enyo
@CALL src\webapp\enyo\tools\minify.bat package.js -output %TARGET_FOLDER%\app-min %@
goto done

:exit
echo *** Minify process aborted
echo.
echo *** Required parameters:
echo *** param: project type [enyo / sencha-touch / other (using requirejs)] 
echo.

:done
