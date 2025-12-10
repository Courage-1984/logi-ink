# Fix mobile menu by removing conflicting inline styles from all HTML files

$htmlFiles = @("index.html", "about.html", "services.html", "contact.html", "projects.html", "pricing.html", "seo-services.html", "reports.html", "showcase.html", "privacy-policy.html", "terms-of-service.html", "404.html")

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "Processing $file..."
        $content = Get-Content $file -Raw -Encoding UTF8

        # Remove the specific inline mobile nav-menu block
        $oldBlock = @'
        .nav-menu {
          position: fixed;
          top: 60px;
          left: -100%;
          width: 100%;
          height: calc(100vh - 60px);
          background: rgba(10, 10, 10, 0.98);
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding-top: var(--space-8);
          gap: var(--space-8);
          transition: left 0.3s ease;
        }
        .nav-menu.active {
          left: 0;
        }
        .hamburger {
          display: flex;
        }
        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(8px, 8px);
        }
        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }
        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }
'@

        $newBlock = "        /* Mobile nav-menu and hamburger styles removed - handled by external CSS */`n"

        if ($content -match [regex]::Escape($oldBlock)) {
            $content = $content -replace [regex]::Escape($oldBlock), $newBlock
            Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
            Write-Host "  Fixed: $file"
        } else {
            Write-Host "  Not found in: $file"
        }
    }
}

Write-Host "`nDone! Test the mobile menu now."
