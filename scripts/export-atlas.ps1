param([string]$Source)
$ErrorActionPreference = 'Stop'
$target = Join-Path (Split-Path $PSScriptRoot -Parent) 'dist/assets/atlas'
$app = New-Object -ComObject PowerPoint.Application
$deck = $null
try {
  $deck = $app.Presentations.Open($Source, -1, 0, 0)
  $slide = $deck.Slides.Item(1)
  $items = @()
  foreach ($shape in $slide.Shapes) {
    $id = [int]$shape.Id
    $text = ''
    if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) { $text = $shape.TextFrame.TextRange.Text }
    $name = "shape-$id.svg"
    $shape.Export((Join-Path $target $name), 6)
    $items += [ordered]@{id=$id;name=$shape.Name;text=$text;x=[double]$shape.Left;y=[double]$shape.Top;width=[double]$shape.Width;height=[double]$shape.Height;rotation=[double]$shape.Rotation;type=[int]$shape.Type;asset="assets/atlas/$name"}
  }
  $data = [ordered]@{width=[double]$deck.PageSetup.SlideWidth;height=[double]$deck.PageSetup.SlideHeight;objects=$items}
  $data | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $target 'objects.json') -Encoding utf8
  $slide.Export((Join-Path $target 'reference.png'),'PNG',2976,2106)
  Write-Output "Exported $($items.Count) objects"
} finally {
  if ($deck) { $deck.Close() }
  # Do not quit PowerPoint: the application may be shared with the user.
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}

# PowerPoint's SVG export downsamples embedded pictures; restore source pixels.
& (Join-Path $PSScriptRoot 'restore-source-images.ps1') -Source $Source
