param (
    [string]$docxPath,
    [string]$pdfPath
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open($docxPath)
    # 17 corresponds to wdFormatPDF
    $doc.SaveAs([ref]$pdfPath, [ref]17)
    $doc.Close()
    Write-Host "Successfully converted $docxPath to $pdfPath"
} catch {
    Write-Error $_.Exception.Message
} finally {
    $word.Quit()
}
