---
title: "Tool Query Parameters: Base64 + yt-dlp"
author: nadzu
pubDatetime: 2026-04-19T12:00:00Z
slug: tool-query-params
featured: false
draft: false
tags:
  - Tools
  - Docs
description: "Complete reference for launching nadzu.me tools through query parameters, including exact names and examples for Base64 and yt-dlp."
---

This guide documents the exact URL query parameters supported by the `nadzu.me` toolkit.
It is intended for developers, documentation writers, and power users who want to launch tools directly with prefilled values.

## Overview

The tools workspace is mounted from a single shared entrypoint: `/tools/`.
When the `tool` query parameter is present, the launcher resolves the requested tool and applies any additional parameters before mounting the UI.

## Common parameter aliases

The toolkit supports both long and short query names:

- `tool` / `t`
- `input` / `in`
- `output` / `out`
- `action` / `act`
- `url` / `u`

Use the short form for compact share links and the long form for written documentation.

## Base64 tool

The Base64 tool can encode, decode, or clear its fields on load.

### Supported parameters

- `tool=base64` or `t=base64`
- `input=<text>` or `in=<text>`
- `output=<text>` or `out=<text>`
- `action=encode|decode|clear` or `act=encode|decode|clear`

### Examples

<a href="https://nadzu.me/tools/?tool=base64&action=encode&input=Hello%20World" target="_blank" rel="noreferrer noopener">Launch the Base64 tool with text to encode</a>

```text
https://nadzu.me/tools/?tool=base64&action=encode&input=Hello%20World
```

<a href="https://nadzu.me/tools/?t=base64&act=decode&in=SGVsbG8gV29ybGQ%3D" target="_blank" rel="noreferrer noopener">Decode a Base64 payload directly</a>

```text
https://nadzu.me/tools/?t=base64&act=decode&in=SGVsbG8gV29ybGQ%3D
```

<a href="https://nadzu.me/tools/?tool=base64&action=clear" target="_blank" rel="noreferrer noopener">Load Base64 with cleared fields</a>

```text
https://nadzu.me/tools/?tool=base64&action=clear
```

## yt-dlp downloader

The yt-dlp tool accepts a single media URL and opens the downloader with that target prefilled.

### Supported parameters

- `tool=ytdlp` or `t=ytdlp`
- `url=<video-url>` or `u=<video-url>`

### Examples

<a href="https://nadzu.me/tools/?tool=ytdlp&url=https://youtu.be/dQw4w9WgXcQ" target="_blank" rel="noreferrer noopener">Launch the yt-dlp downloader with a YouTube URL</a>

```text
https://nadzu.me/tools/?tool=ytdlp&url=https://youtu.be/dQw4w9WgXcQ
```

<a href="https://nadzu.me/tools/?t=ytdlp&u=https://youtu.be/dQw4w9WgXcQ" target="_blank" rel="noreferrer noopener">Launch the downloader using short alias parameters</a>

```text
https://nadzu.me/tools/?t=ytdlp&u=https://youtu.be/dQw4w9WgXcQ
```

## Best practices

- Always URL-encode values that contain spaces, symbols, or special characters.
- Use the alias form (`t`, `in`, `out`, `act`, `u`) for compact share links.
- Use the long form (`tool`, `input`, `output`, `action`, `url`) for documentation clarity.
- Use `action=clear` to ensure a fresh Base64 session on load.

## Implementation details

The query string is normalized by the shared tool URL resolver before the tool mounts.
This ensures the requested tool is selected safely and the supplied values are applied consistently.

## Reference table

| Tool   | Parameter       | Alias        | Purpose                   |
| ------ | --------------- | ------------ | ------------------------- |
| Base64 | `tool=base64`   | `t=base64`   | Select the Base64 utility |
| Base64 | `input=...`     | `in=...`     | Prefill the input field   |
| Base64 | `output=...`    | `out=...`    | Prefill the output field  |
| Base64 | `action=encode` | `act=encode` | Prepare encode mode       |
| Base64 | `action=decode` | `act=decode` | Prepare decode mode       |
| Base64 | `action=clear`  | `act=clear`  | Clear fields on load      |
| yt-dlp | `tool=ytdlp`    | `t=ytdlp`    | Select the downloader     |
| yt-dlp | `url=...`       | `u=...`      | Prefill the media URL     |

## When to use query params

This mechanism is useful for:

- Sharing a ready-to-use tool link with teammates
- Embedding starting states in documentation
- Opening tools from bookmarks or browser shortcuts
- Preloading sample content in demos

For maximum compatibility, always encode query values and validate the final URL in the browser before sharing.
