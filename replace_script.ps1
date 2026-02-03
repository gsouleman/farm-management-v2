$path = 'c:\Farm2.0\frontend\src\pages\Dashboard.jsx'
$content = Get-Content $path -Raw
$old = 'getCameroonRegion(f.coordinates?.coordinates?.[1], f.coordinates?.coordinates?.[0]).toUpperCase()'
$new = '(getCameroonRegion(f.coordinates?.coordinates?.[1], f.coordinates?.coordinates?.[0]) + " Region").toUpperCase()'
if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    Set-Content $path $content -NoNewline
    Write-Output "Replacement successful!"
} else {
    Write-Output "Target string not found."
}
