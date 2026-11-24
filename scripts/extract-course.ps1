$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root=Split-Path $PSScriptRoot -Parent
$target=Join-Path $root 'dist/assets/course'
New-Item -ItemType Directory -Force $target | Out-Null
$names=@('Ch13(1)','Ch14(1)','Ch16(1)','Ch17(1)','Ch18(1)','Ch19-I(1)','Ch19-II(1)','Ch20','Ch21','Ch22')
$slides=@()
foreach($name in $names){
 $zip=[IO.Compression.ZipFile]::OpenRead("D:/火狐下载专用/$name.pptx")
 try{
 foreach($e in $zip.Entries | Where-Object {$_.FullName -match '^ppt/slides/slide\d+\.xml$'}){
  $num=[int]([regex]::Match($e.FullName,'slide(\d+)').Groups[1].Value)
  $r=[IO.StreamReader]::new($e.Open());[xml]$x=$r.ReadToEnd();$r.Dispose()
  $ns=[Xml.XmlNamespaceManager]::new($x.NameTable);$ns.AddNamespace('a','http://schemas.openxmlformats.org/drawingml/2006/main')
  $texts=@($x.SelectNodes('//a:p',$ns)|ForEach-Object {($_.SelectNodes('.//a:t',$ns)|ForEach-Object {$_.InnerText}) -join ''}|Where-Object {$_})
  $slides += [ordered]@{chapter=$name.Replace('(1)','');slide=$num;text=$texts -join "`n";source="$name.pptx";image="assets/course/$($name.Replace('(1)',''))-$num.png"}
 }
 }finally{$zip.Dispose()}
}
$json=$slides|ConvertTo-Json -Depth 4
[IO.File]::WriteAllText((Join-Path $target 'slides.json'),$json,[Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $root 'dist/course-slides.js'),"const courseSlides = $json;",[Text.UTF8Encoding]::new($false))
Write-Output "Extracted $($slides.Count) slides"
