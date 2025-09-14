# Vitalis CLI - Complete Setup Instructions

## 🏥 Overview

Vitalis CLI is a terminal-based emergency preparedness and first-aid assistant that runs completely offline using a local AI model. It provides real-time guidance for medical emergencies while maintaining strict safety protocols.

**⚠️ IMPORTANT DISCLAIMER:** This application is NOT a medical diagnostic tool. It provides general safety information and basic first-aid concepts only. Always seek professional medical help for emergencies and medical concerns.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Operating System:** Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Python:** Version 3.10 or higher
- **RAM:** At least 8GB (16GB recommended for optimal performance)
- **Storage:** At least 20GB free space for the AI model
- **Internet:** Required only for initial setup (downloads)

---

## 🚀 Step-by-Step Installation

### Step 1: Install Ollama

Ollama is the local AI server that runs the language model.

#### For Windows:

1. Visit [ollama.ai](https://ollama.ai)
2. Download the Windows installer
3. Run the installer and follow the setup wizard
4. Ollama will be installed and added to your PATH

#### For macOS:

```bash
# Install using Homebrew (recommended)
brew install ollama

# Or download from ollama.ai and run the installer
```

#### For Linux (Ubuntu/Debian):

```bash
# Install using the official script
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Start Ollama Server

Open your terminal/command prompt and start the Ollama server:

```bash
ollama serve
```

**Keep this terminal window open** - the server needs to stay running.

### Step 3: Download the AI Model

In a **new terminal window**, download the required model:

```bash
ollama pull gpt-oss:20b
```

**Note:** This is a large download (approximately 20GB) and may take 30-60 minutes depending on your internet connection.

### Step 4: Set Up Python Environment

Navigate to the Vitalis CLI directory:

```bash
cd "/Users/sam/Documents/repositories/Vitalis 2.0/Vitalis-2.0"
```

Create a virtual environment:

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 5: Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### Step 6: Verify Installation

Test that everything is working:

```bash
# Make sure Ollama is running (in one terminal)
ollama serve

# In another terminal, verify the model is available
ollama list
```

You should see `gpt-oss:20b` in the list.

---

## 🎯 Running the Application

### Basic Usage

1. **Start Ollama Server** (if not already running):

   ```bash
   ollama serve
   ```

2. **Activate Python Environment**:

   ```bash
   cd "/Users/sam/Documents/repositories/Vitalis 2.0/Vitalis-2.0"
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Run Vitalis CLI**:
   ```bash
   python vitalis_cli.py
   ```

### Command Line Options

You can customize the application with various options:

```bash
# Use a different model
python vitalis_cli.py --model llama2:7b

# Adjust temperature (creativity level)
python vitalis_cli.py --temp 0.5

# Use different server URL
python vitalis_cli.py --base-url http://127.0.0.1:11434

# Get help
python vitalis_cli.py --help
```

### Environment Variables

You can set these environment variables for convenience:

```bash
# Set default model
export OLLAMA_MODEL="gpt-oss:20b"

# Set default temperature
export OLLAMA_TEMP="0.2"

# Set default server URL
export OLLAMA_BASE_URL="http://localhost:11434"
```

---

## 💬 Using the Application

### Available Commands

Once the application is running, you can use these commands:

- **`/new`** - Start a new conversation
- **`/save <path>`** - Save the current conversation transcript to a JSON file
- **`/model <name>`** - Switch to a different model
- **`/help`** - Show available commands
- **`/quit`** - Exit the application

### Example Usage

```
You: I have a cut on my finger that's bleeding
Vitalis: 1. Apply direct pressure with a clean cloth or gauze
2. Elevate the injured area above heart level if possible
3. Continue pressure for at least 5-10 minutes
4. Clean the wound gently with water if possible
5. Cover with a clean bandage

When to seek help: If bleeding doesn't stop after 10 minutes of pressure, or if the cut is deep, gaping, or caused by a dirty object.

I'm not a medical professional - seek professional help if needed.
```

### Emergency Scenarios

The application automatically detects life-threatening emergencies and provides immediate guidance:

```
You: Someone is not breathing
Vitalis: 🚨 CALL EMERGENCY SERVICES NOW (e.g., 911)

1. Apply direct pressure to any bleeding
2. Place the person in the recovery position if unconscious
3. Ensure the area is safe from hazards

⚠️ I'm not a medical professional - seek immediate professional help.
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot connect to Ollama server"

**Problem:** The application can't connect to the Ollama server.

**Solutions:**

- Ensure Ollama is running: `ollama serve`
- Check if the server is accessible: `curl http://localhost:11434/api/tags`
- Verify the port (11434) is not blocked by firewall

#### 2. "Model 'gpt-oss:20b' not found"

**Problem:** The required model is not installed.

**Solutions:**

- Download the model: `ollama pull gpt-oss:20b`
- Check available models: `ollama list`
- Use a different model: `python vitalis_cli.py --model llama2:7b`

#### 3. "Python not found" or "pip not found"

**Problem:** Python or pip is not installed or not in PATH.

**Solutions:**

- Install Python 3.10+ from [python.org](https://python.org)
- Ensure Python is added to your system PATH
- Use `python3` instead of `python` if both versions are installed

#### 4. "Permission denied" errors

**Problem:** Insufficient permissions to create virtual environment or install packages.

**Solutions:**

- Run terminal as administrator (Windows) or use `sudo` (macOS/Linux)
- Check file permissions in the project directory
- Try installing in a different location

#### 5. Slow or no responses

**Problem:** The AI model is responding slowly or not at all.

**Solutions:**

- Ensure you have sufficient RAM (8GB+ recommended)
- Close other memory-intensive applications
- Try a smaller model: `ollama pull llama2:7b`
- Check system resources: `ollama ps`

#### 6. Virtual environment issues

**Problem:** Virtual environment activation fails.

**Solutions:**

- Recreate the virtual environment: `rm -rf venv && python3 -m venv venv`
- Use absolute paths for activation
- Check Python installation: `python3 --version`

### Getting Help

If you encounter issues not covered here:

1. **Check the logs:** Look for error messages in the terminal
2. **Verify prerequisites:** Ensure all requirements are met
3. **Test components individually:** Verify Ollama, Python, and the model separately
4. **Check system resources:** Ensure sufficient RAM and storage
5. **Restart services:** Try restarting Ollama and the application

---

## 🔒 Security and Safety

### Offline Operation

- The application only connects to `localhost:11434`
- No data is sent to external servers
- All processing happens locally on your machine

### Safety Features

- **Red-flag detection:** Automatically identifies life-threatening emergencies
- **Content filtering:** Blocks dangerous medical procedures and medication dosages
- **Emergency escalation:** Directs users to call emergency services for serious situations
- **Disclaimer system:** Always reminds users this is not a replacement for professional medical care

### Data Privacy

- Conversations are stored locally only
- No data is transmitted over the internet
- You can save/delete conversation transcripts as needed

---

## 📚 Additional Resources

### Alternative Models

If `gpt-oss:20b` is too large for your system, try these alternatives:

```bash
# Smaller, faster models
ollama pull llama2:7b
ollama pull codellama:7b
ollama pull mistral:7b

# Use with Vitalis CLI
python vitalis_cli.py --model llama2:7b
```

### Performance Optimization

- **Close unnecessary applications** to free up RAM
- **Use SSD storage** for faster model loading
- **Consider smaller models** if you have limited resources
- **Monitor system resources** during use

### Backup and Recovery

- **Save important conversations:** Use `/save <filename>` command
- **Backup your virtual environment:** Copy the `venv` folder
- **Document your setup:** Keep track of which models you've downloaded

---

## 🆘 Emergency Use

**Remember:** This application is for educational and preparedness purposes only. In a real emergency:

1. **Call emergency services immediately** (911, 112, etc.)
2. **Follow professional medical advice**
3. **Use this tool only for basic first-aid guidance**
4. **Never delay professional medical care**

---

## 📞 Support

For technical issues with the application:

- Check this troubleshooting guide
- Verify all prerequisites are met
- Test each component individually
- Consider using alternative models if performance is poor

For medical emergencies:

- **Call emergency services immediately**
- **Seek professional medical help**
- **Do not rely solely on this application**

---

_Last updated: January 2025_
_Vitalis CLI v1.0 - Emergency Preparedness & First-Aid Helper_


