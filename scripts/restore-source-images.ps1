param([Parameter(Mandatory=$true)][string]$Source)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing
$target=Join-Path (Split-Path $PSScriptRoot -Parent) 'dist/assets/atlas'
$zip=[IO.Compression.ZipFile]::OpenRead($Source)
function Read-ZipText($name){$r=[IO.StreamReader]::new($zip.GetEntry($name).Open());try{$r.ReadToEnd()}finally{$r.Dispose()}}
try {
 [xml]$rels=Read-ZipText 'ppt/slides/_rels/slide1.xml.rels'
 $targets=@{};foreach($r in $rels.DocumentElement.ChildNodes){$targets[$r.Id]='ppt/'+$r.Target.Replace('../','')}
 [xml]$slide=Read-ZipText 'ppt/slides/slide1.xml'
 $ns=[Xml.XmlNamespaceManager]::new($slide.NameTable)
 $ns.AddNamespace('p','http://schemas.openxmlformats.org/presentationml/2006/main')
 $ns.AddNamespace('a','http://schemas.openxmlformats.org/drawingml/2006/main')
 $records=@()
 foreach($pic in $slide.SelectNodes('//p:pic',$ns)){
  $id=$pic.SelectSingleNode('.//p:cNvPr',$ns).id
  $blip=$pic.SelectSingleNode('.//a:blip',$ns)
  $rid=$blip.GetAttribute('embed','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
  $entry=$targets[$rid]
  # PNG source bytes are restored without resampling or altering source artwork.
  if(-not $entry.EndsWith('.png')){continue}
  $svgPath=Join-Path $target "shape-$id.svg"
  $svg=[IO.File]::ReadAllText($svgPath)
  $pattern='data:image/(?:png|jpeg);base64,[^"\s]+'
  $matches=[regex]::Matches($svg,$pattern)
  # Multiple embedded images can include masks/effects; do not replace them blindly.
  if($matches.Count -ne 1){continue}
  $stream=$zip.GetEntry($entry).Open();$memory=[IO.MemoryStream]::new()
  try{$stream.CopyTo($memory);$bytes=$memory.ToArray()}finally{$stream.Dispose();$memory.Dispose()}
  $sourceHash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLower()
  # PowerPoint stores transparent-color effects separately from the original PNG.
  # Apply only the explicit source color; never remove whites from other artwork.
  $transparentColor=$null
  $effect=$blip.SelectSingleNode('a:clrChange[a:clrTo/a:srgbClr/a:alpha[@val="0"]]',$ns)
  if($effect){
   $transparentColor=$effect.SelectSingleNode('a:clrFrom/a:srgbClr',$ns).val
   if($transparentColor){
    $inputStream=[IO.MemoryStream]::new($bytes)
    $bitmap=[Drawing.Bitmap]::new($inputStream)
    $outputStream=[IO.MemoryStream]::new()
    try{
     $bitmap.MakeTransparent([Drawing.ColorTranslator]::FromHtml('#'+$transparentColor))
     $bitmap.Save($outputStream,[Drawing.Imaging.ImageFormat]::Png)
     $bytes=$outputStream.ToArray()
    }finally{$bitmap.Dispose();$inputStream.Dispose();$outputStream.Dispose()}
   }
  }
  $replacement='data:image/png;base64,'+[Convert]::ToBase64String($bytes)
  $updated=$svg.Substring(0,$matches[0].Index)+$replacement+$svg.Substring($matches[0].Index+$matches[0].Length)
  [IO.File]::WriteAllText($svgPath,$updated,[Text.UTF8Encoding]::new($false))
  $records+=@{id=[int]$id;source=$entry;bytes=$bytes.Length;sourceSha256=$sourceHash;transparentColor=$transparentColor;sha256=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLower()}
 }
 $records|ConvertTo-Json -Depth 4|Set-Content -LiteralPath (Join-Path $target 'source-images.json') -Encoding utf8
 Write-Output "Restored $($records.Count) original-resolution images without changing SVG geometry"
}finally{$zip.Dispose()}
