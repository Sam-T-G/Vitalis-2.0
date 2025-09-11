# Vitalis CLI

**Vitalis CLI** is a minimal, single-file terminal chat application that interacts with a local Ollama server running `gpt-oss-20b`. It streams tokens in real-time, operates fully offline (localhost only), and includes a safety layer for a medical-aid assistant role-play (non-diagnostic).

## ⚠️ Important Disclaimer

**This application is NOT a medical diagnostic tool.** It provides general safety information and basic first-aid concepts only. Always seek professional medical help for emergencies and medical concerns.

## Installation and Setup

### 1. Install and Start Ollama

Download and install Ollama from [ollama.ai](https://ollama.ai), then start the server:

```bash
ollama serve
```

### 2. Download the Model

Run the following command to download the `gpt-oss:20b` model (one-time, online):

```bash
ollama pull gpt-oss:20b
```

### 3. Install Dependencies

Create a virtual environment and install the required dependencies:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Run Vitalis CLI

Execute the script using Python 3.10 or higher:

```bash
source venv/bin/activate  # Activate virtual environment
python vitalis_cli.py
```

## Usage

### Commands

- **`/new`** - Start a new conversation
- **`/save <path>`** - Save the current conversation transcript to a JSON file
- **`/model <name>`** - Switch to a different model (e.g., `gpt-oss:20b`)
- **`/help`** - Show available commands
- **`/quit`** - Exit the application

### Command Line Options

```bash
python vitalis_cli.py --help
python vitalis_cli.py --model llama2:7b --temp 0.5
python vitalis_cli.py --base-url http://127.0.0.1:11434
```

### Environment Variables

- `OLLAMA_BASE_URL` - Base URL of the Ollama server (default: `http://localhost:11434`)
- `OLLAMA_MODEL` - Model to use (default: `gpt-oss:20b`)
- `OLLAMA_TEMP` - Temperature setting (default: `0.2`)

## Safety Features

### Red-Flag Detection

The application automatically detects emergency situations and immediately directs users to call emergency services for:

- Breathing problems (not breathing, gasping)
- Severe bleeding or trauma
- Chest pain or stroke symptoms
- Seizures, overdoses, or poisoning
- Fire, gas leaks, or electrical hazards
- And other life-threatening emergencies

### Content Filtering

The application filters out:

- Medication dosages and dosing instructions
- Invasive medical procedures
- Diagnostic recommendations

## Requirements

- Python 3.10+
- `requests` library (included in requirements.txt)
- Ollama server running locally
- `gpt-oss:20b` model (or compatible model)

**Note:** It's recommended to use a virtual environment to avoid conflicts with system Python packages.

## Offline Operation

This application is designed to work completely offline and will only connect to `localhost:11434`. It will refuse to connect to any other host for security reasons.

## License

This project is provided as-is for educational and safety awareness purposes.
