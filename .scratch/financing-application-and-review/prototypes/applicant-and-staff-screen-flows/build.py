from pathlib import Path
import base64
root=Path(__file__).parent
fonts=root/'fonts'
font_css='\n'.join('@font-face{font-family:'+name+';src:url(data:font/ttf;base64,'+base64.b64encode((fonts/file).read_bytes()).decode()+')}' for name,file in [('NotoArabic','NotoSansArabic-Regular.ttf'),('NotoSans','NotoSans-Regular.ttf')])
(root/'index.html').write_text('''<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>رِفد · استعراض تدفق الشاشات</title><style>'''+font_css+'\n'+(root/'style.css').read_text()+'''</style></head><body><a href="#main" data-focus="main" class="skip">تجاوز إلى الشاشة / Skip to screen</a><div id="root"></div><dialog id="dialog" aria-labelledby="dialog-title"></dialog><div id="live" role="status" aria-live="polite" class="alertlive" hidden></div><script>'''+(root/'data.js').read_text()+'\n'+(root/'app.js').read_text()+'''</script></body></html>''')
(root/'FONT-LICENSE.txt').write_text((fonts/'LICENSE.txt').read_text())
