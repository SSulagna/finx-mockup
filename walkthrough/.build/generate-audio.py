"""
Generates per-scene MP3 files using Microsoft Edge neural TTS (en-US-AriaNeural).
Run from repo root:  python walkthrough/.build/generate-audio.py

Requires: pip install edge-tts
"""

import asyncio
import os
import edge_tts

VOICE = "en-US-AriaNeural"
RATE  = "-5%"   # slightly deliberate for a demo walkthrough
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "audio")

SCENES = [
    {
        "id": "01-intro",
        "text": (
            "Hi, welcome to an approximately six-minute walkthrough of the proposed UST FinX "
            "documentation portal. I'll cover the public marketing layer, the documentation layer "
            "for developers and bank operators, and the internal hub for UST staff. "
            "I'll also explain how the three tiers are structured, "
            "and where the authentication question fits."
        ),
    },
    {
        "id": "02-public",
        "text": (
            "The homepage is the entry point for bank evaluators, CIOs, and architects. "
            "They land here from a Google search or a sales conversation. "
            "It opens with the core argument from the white paper: "
            "the problem with big-bang transformation and point solutions, then the FinX response. "
            "The Approach section maps to white paper sections one through three: "
            "BIAN-aligned, iterative, coexistence-first. "
            "The Innovation section comes from white paper section seven: "
            "architectural standards don't slow innovation, they compound it. "
            "The Why UST section surfaces the partnership argument: "
            "thirty-three thousand employees, two billion dollars in annual revenue, "
            "managed services beyond programme delivery. "
            "The ecosystem diagram is taken directly from the FinX sales deck: "
            "Glue at the center, the connector ecosystem around it, the cores below. "
            "The homepage closes with the white paper's Section 11 structure: "
            "what you gain, next steps, a closing pitch, the contact line."
        ),
    },
    {
        "id": "03-nav",
        "text": (
            "The top navigation covers five public sections: "
            "Architecture, Platform, Modernization, Use cases, and Resources. "
            "Each one is a fully built page with real content from the white paper."
        ),
    },
    {
        "id": "04-platform",
        "text": (
            "The Platform section introduces FinX Glue and FinX Glass as separate products. "
            "Glue is the orchestration layer for developers. "
            "Glass is the operations console for bank staff. "
            "Each product page has four capability cards, an ecosystem overview, "
            "and two clear calls to action: one into the documentation, "
            "one into the architecture guide."
        ),
    },
    {
        "id": "05-modernization",
        "text": (
            "The Modernization section is where FinX makes a specific claim about time to value. "
            "Four paths, two metrics each, so they can be honestly compared. "
            "Greenfield: six months to first customer. "
            "Coexistence: nine months to first new capability. "
            "Progressive: nine months per domain, eighteen to thirty-six month programme total. "
            "Full Modernization: thirty-six plus months to complete legacy retirement. "
            "Each path has a detail page showing the phased timeline "
            "and a link forward into the documentation."
        ),
    },
    {
        "id": "06a-glue-docs",
        "text": (
            "Now the documentation layer. "
            "This is Tier 2 in the proposed access model: fully public, no login required. "
            "The same decision Stripe, Plaid, and Twilio have all made: "
            "open documentation works as a sales asset. "
            "The Glue Developer Hub has a three-column layout: "
            "sidebar navigation on the left, content in the center, On this page anchors on the right. "
            "Five real pages are built. "
            "Quickstart walks a developer from zero to a working integration in thirty minutes: "
            "authentication, tenant context, first API call, webhook verification. "
            "The journey guides are the heart of the developer documentation. "
            "The onboarding guide walks the six-call sequence: "
            "party initiation, document upload, identity verification, AML screening, "
            "and lifecycle promotion. "
            "Placeholder links are clearly marked. "
            "Hovering shows exactly what each will contain in production."
        ),
    },
    {
        "id": "06b-glass-docs",
        "text": (
            "The Glass Operations Guide has the same three-column structure, "
            "but organized by role. "
            "Bank operations staff navigate by what they do, not by what the API does. "
            "Each role has a landing page listing common tasks. "
            "Each task is a step-by-step walkthrough: "
            "numbered steps, a permission callout, related tasks at the bottom. "
            "This mirrors how Stripe and Twilio organize operator-facing documentation: "
            "bank staff find what they need by job function, not by endpoint name. "
            "The result is faster onboarding for operations teams, "
            "and fewer support tickets back to UST delivery."
        ),
    },
    {
        "id": "07-internal",
        "text": (
            "The internal hub is Tier 3: UST employees only. "
            "The entry point is a small pill in the top navigation that says UST staff. "
            "Clicking it opens a sign-in modal. "
            "In production this would authenticate against UST's Microsoft Entra ID. "
            "For the demo, the password is finx-twenty-twenty-six. "
            "After sign-in, the nav pill turns purple and says UST Internal. "
            "The hub has six categories: engagement playbooks, sales enablement, "
            "architecture deep-dives, delivery references, client engagements, "
            "and product requirements."
        ),
    },
    {
        "id": "08-three-tier",
        "text": (
            "To summarise the architecture: three tiers under one brand. "
            "Tier one is the fully public marketing layer. "
            "Tier two is the public documentation. "
            "Tier three is UST internal, gated by single sign-on. "
            "In production these would be three separate hosting properties: "
            "ustfinx.com for the marketing site, "
            "docs.ustfinx.com for the documentation, "
            "and internal.ustfinx.com, or inside the UST intranet, for the internal layer. "
            "The mockup compresses all three into one URL to show the unified experience. "
            "The documentation layer has eight fully built example pages. "
            "The remaining navigation items show planned destinations on hover."
        ),
    },
    {
        "id": "09-outro",
        "text": (
            "That concludes the walkthrough. "
            "Three tiers under one brand: the public marketing layer, "
            "the public documentation, and the UST internal hub gated by single sign-on. "
            "Open questions to align on: "
            "whether the three-tier model maps to how UST wants to operate; "
            "whether SSO via Entra ID is the right authentication path; "
            "and whether this is ready to walk through with FinX leadership. "
            "Thank you for watching."
        ),
    },
]


async def generate_scene(scene: dict) -> None:
    out_path = os.path.join(OUT_DIR, scene["id"] + ".mp3")
    communicate = edge_tts.Communicate(scene["text"], VOICE, rate=RATE)
    await communicate.save(out_path)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"  {scene['id']}.mp3  {size_kb:.0f} KB")


async def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Voice: {VOICE}  Rate: {RATE}")
    print(f"Output: {os.path.abspath(OUT_DIR)}\n")
    for scene in SCENES:
        await generate_scene(scene)
    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
