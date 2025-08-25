# PowerShell script to set up GitHub repository for Dairy Sustainability Hub
# Run this script after creating a GitHub repository

Write-Host "🚀 Setting up GitHub repository for Dairy Sustainability Hub" -ForegroundColor Green
Write-Host ""

# Get GitHub username
$githubUsername = Read-Host "Enter your GitHub username"
$repoName = "dairy-sustainability-hub"

Write-Host "📝 Adding remote origin..." -ForegroundColor Yellow
git remote add origin "https://github.com/$githubUsername/$repoName.git"

Write-Host "🔄 Renaming branch to main..." -ForegroundColor Yellow
git branch -M main

Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "✅ Success! Your repository is now on GitHub:" -ForegroundColor Green
Write-Host "   https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Go to https://vercel.com" -ForegroundColor White
Write-Host "   2. Sign in with GitHub" -ForegroundColor White
Write-Host "   3. Import your repository" -ForegroundColor White
Write-Host "   4. Set up environment variables" -ForegroundColor White
Write-Host "   5. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
