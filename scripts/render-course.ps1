$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$target=Join-Path $root 'dist/assets/course'
$names=@('Ch13(1)','Ch14(1)','Ch16(1)','Ch17(1)','Ch18(1)','Ch19-I(1)','Ch19-II(1)','Ch20','Ch21','Ch22')
$app=New-Object -ComObject PowerPoint.Application
try {
 foreach($name in $names){
  $deck=$app.Presentations.Open("D:/火狐下载专用/$name.pptx",-1,0,0)
  try {foreach($slide in $deck.Slides){
   $file=Join-Path $target "$($name.Replace('(1)',''))-$($slide.SlideIndex).png"
   if(!(Test-Path -LiteralPath $file)){$slide.Export($file,'PNG',1400,1050)}
  }}finally{$deck.Close()}
  Write-Output "Rendered $name"
 }
}finally{[void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)}
