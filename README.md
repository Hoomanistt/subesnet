# Edge-Stream-Benchmark 🚀

A lightweight, high-performance diagnostic utility designed for testing **bidirectional WebStream throughput** and **global edge latency** using Supabase Edge Runtime (Deno).

## 📋 Overview

This project serves as a benchmarking tool to measure the efficiency of data relaying across distributed edge nodes. By leveraging the `Deno.serve` API and `duplex: "half"` fetch capabilities, it provides a transparent path for analyzing network performance between end-users and upstream targets.

### Key Features
- **Real-time Latency Tracking:** Detailed logging of request-to-response duration.
- **Bidirectional Streaming:** Full support for concurrent data flow using WebStreams.
- **Header Scrubbing:** Automatically removes hop-by-hop headers to ensure a clean benchmarking environment.
- **Trace IDs:** Every request is assigned a unique UUID for easy debugging and log analysis.

## 🛠️ Technical Architecture

The tool is built specifically for the **Supabase Edge Runtime**, utilizing:
- **Deno v1.x / 2.x** compatibility.
- **V8 Isolates** for minimal cold-start overhead.
- **Web Standard Fetch API** for seamless integration with modern networking protocols.

## 🚀 Quick Start

### 1. Prerequisites
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed on your local machine.
- A Supabase account and a linked project.

### 2. Configuration
The tool requires a `TARGET_DOMAIN` secret to define the upstream benchmarking endpoint.

```bash
supabase secrets set TARGET_DOMAIN="[https://your-target-endpoint.com](https://your-target-endpoint.com)"
