param(
    [ValidateSet('all', 'unit', 'widget', 'e2e')]
    [string]$Type = 'all'
)

$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

# Arquivos que não fazem sentido medir (gerados, boilerplate, entrypoint)
$ignore = @(
    '**/*.g.dart',
    '**/*.freezed.dart',
    '**/generated/**',
    'lib/main.dart'
)

function Invoke-Coverage($name, $paths, $outDir) {
    Write-Host "==> Cobertura: $name" -ForegroundColor Cyan
    flutter test --coverage --coverage-path="$outDir/lcov.info" @paths
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    # remove arquivos ignorados do relatório
    lcov --remove "$outDir/lcov.info" @ignore -o "$outDir/lcov.clean.info" --ignore-errors unused
    genhtml "$outDir/lcov.clean.info" -o "$outDir/html" --quiet
    Write-Host "Relatório: $outDir/html/index.html" -ForegroundColor Green
}

New-Item -ItemType Directory -Force coverage | Out-Null

switch ($Type) {
    'unit' {
        # tudo que não é tela/widget
        Invoke-Coverage 'unitários' @('test/core', 'test/data', 'test/services', 'test/presentation/controllers') 'coverage/unit'
    }
    'widget' {
        Invoke-Coverage 'widgets/telas' @('test/presentation/screens', 'test/presentation/widgets') 'coverage/widget'
    }
    'e2e' {
        # precisa de emulador ou dispositivo conectado
        Write-Host '==> Cobertura: E2E (integration_test)' -ForegroundColor Cyan
        flutter test integration_test/app_test.dart --coverage --coverage-path=coverage/e2e/lcov.info
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        lcov --remove coverage/e2e/lcov.info @ignore -o coverage/e2e/lcov.clean.info --ignore-errors unused
        genhtml coverage/e2e/lcov.clean.info -o coverage/e2e/html --quiet
    }
    'all' {
        Invoke-Coverage 'test/ completo' @('test') 'coverage/all'
    }
}