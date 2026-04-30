# Generates per-scene WAV files using Microsoft Zira (SAPI).
# Run from repo root: powershell -ExecutionPolicy Bypass -File walkthrough\.build\generate-audio.ps1

Add-Type -AssemblyName System.Speech
$outDir = Join-Path $PSScriptRoot "..\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$scenes = @(
  @{ id = "01-intro"; text = "Hi Veselina. This is a four minute walkthrough of the proposed UST FinX documentation portal. The mockup is live at finx dash mockup dot vercel dot app. I will cover the public marketing layer, the documentation layer for developers and bank operators, and the internal hub for UST staff. I will also explain how the three tiers are structured. And where the authentication question fits." },
  @{ id = "02-public"; text = "The homepage is the entry point for bank evaluators, CIOs, and architects. They land here from a Google search or a sales conversation. It opens with the core argument from the white paper. The problem with big-bang transformation and point solutions, then the FinX response. The Approach section maps directly to white paper sections one through three. Banking Industry Architecture Network, or BIAN, aligned. Iterative. Coexistence first. The Innovation section comes from white paper section seven. The argument is that architectural standards do not slow innovation. They compound it. The Why UST section surfaces the partnership argument. Thirty-three thousand employees. Two billion dollars in annual revenue. Managed services beyond programme delivery. The ecosystem diagram is taken directly from the FinX sales deck. FinX Glue at the centre, the connector ecosystem around it, the cores below. The homepage closes with the white paper's Section eleven structure. What you gain on the left. Next steps on the right. A specific closing pitch. Then the contact line." },
  @{ id = "03-nav"; text = "The top navigation covers five public sections. Architecture, Platform, Modernization, Use cases, and Resources. Each one is a fully built page with real content from the white paper." },
  @{ id = "04-platform"; text = "The Platform section introduces FinX Glue and FinX Glass as separate products. Glue is the orchestration layer for developers. Glass is the operations console for bank staff. Each product page has four capability cards, an ecosystem overview, and two clear calls to action. One into the documentation. One into the architecture guide." },
  @{ id = "05-modernization"; text = "The Modernization section is where FinX makes a specific claim about time to value. Four paths. Two metrics each, so they can be honestly compared. Greenfield. Six months to first customer. Coexistence. Nine months to first new capability. Progressive. Nine months per domain. Eighteen to thirty-six month programme total. Full Modernization. Thirty-six plus months to complete legacy retirement. Each path has a detail page showing the phased timeline. And a link forward into the documentation." },
  @{ id = "06a-glue-docs"; text = "Now the documentation layer. This is Tier 2 in the proposed access model. Fully public. No login required. The same decision Stripe, Plaid, and Twilio have all made. Open documentation works as a sales asset. The Glue Developer Hub has a three column layout. Sidebar navigation on the left, content in the centre, On this page anchors on the right. Five real pages are built. Quickstart walks a developer from zero to a working integration in thirty minutes. Authentication, tenant context, first API call, webhook verification. The journey guides are the heart of the developer documentation. The onboarding guide walks the six call sequence. Party initiation, document upload, identity verification, anti money laundering, or AML, screening, and lifecycle promotion. Placeholder links are clearly marked. Hovering shows exactly what each one will contain in production." },
  @{ id = "06b-glass-docs"; text = "The Glass Operations Guide has the same three column structure. But organized by role. Bank operations staff navigate by what they do, not by what the application programming interface, or API, does. Each role has a landing page listing common tasks. Each task is a step by step walkthrough. It includes numbered steps, a permission callout, and related tasks at the bottom. This mirrors how Stripe and Twilio organise operator-facing documentation. Bank staff find what they need by job function, not by endpoint name. The result is faster onboarding for operations teams. And fewer support tickets back to UST delivery." },
  @{ id = "07-internal"; text = "The internal hub is Tier 3. UST employees only. The entry point is a small pill in the top navigation that says UST staff. Clicking it opens a sign in modal. In production this would authenticate against UST's Microsoft Entra ID. For the demo, the password is finx two thousand twenty-six. After sign in, the nav pill turns purple and says UST Internal. The hub has six categories. Engagement playbooks, sales enablement, architecture deep dives, delivery references, client engagements, and product requirements." },
  @{ id = "08-three-tier"; text = "To summarise the architecture. Three tiers under one brand. Tier one is the fully public marketing layer. Tier two is the public documentation. Tier three is UST internal, gated by single sign-on, or SSO. In production these would be three separate hosting properties. ust finx dot com for the marketing site. docs dot ust finx dot com for the documentation. internal dot ust finx dot com, or inside the UST intranet, for the internal layer. The mockup compresses all three into one URL to show the unified experience. The documentation layer has eight fully built example pages. The remaining navigation items show planned destinations on hover." },
  @{ id = "09-outro";   text = "I would value your perspective on three things. Whether the three tier model maps to how UST actually wants to operate. Whether SSO via Entra ID is the right authentication path. And whether this is ready to walk through with FinX leadership. Happy to discuss whenever works. Thanks Veselina." }
)

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft Zira Desktop")
$synth.Rate = 0  # default, ~180 wpm
$synth.Volume = 100

foreach ($scene in $scenes) {
  $wav = Join-Path $outDir ($scene.id + ".wav")
  Write-Host "Generating $($scene.id).wav ..." -NoNewline
  $synth.SetOutputToWaveFile($wav)
  $synth.Speak($scene.text)
  $synth.SetOutputToNull()
  $size = [math]::Round((Get-Item $wav).Length / 1KB, 1)
  # WAV duration = filesize / (sampleRate * channels * bytesPerSample) for PCM
  # SAPI default: 22050 Hz, 16-bit mono = 44100 bytes/sec
  $dur = [math]::Round((Get-Item $wav).Length / 44100, 1)
  Write-Host " ${size} KB, ~${dur}s"
}

$synth.Dispose()
Write-Host "`nAll audio generated in: $outDir"
