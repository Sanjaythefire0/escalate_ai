# EscalateAI - Professional Complaint Writer & Escalation Generator

A production-quality full-stack application that generates professional complaint drafts for WhatsApp, Email, Escalation, and Follow-up messages using AI.

## Features

- **Multiple Output Formats**: Generate WhatsApp messages, professional emails, escalation letters, and follow-up messages
- **Tone Control**: Choose from Polite, Firm, or Strict tones to match your situation
- **Smart Categories**: Pre-configured templates for common scenarios (college issues, e-commerce refunds, banking, etc.)
- **Professional UI**: Modern, polished SaaS design with smooth UX
- **Easy Export**: Copy to clipboard or download as text files
- **AI-Powered**: Uses OpenRouter with fallback support for reliability

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- React Toastify

### Backend
- FastAPI (Python)
- Pydantic AI
- OpenRouter API integration
- Retry logic and fallback models

## Project Structure

```
complaint-escalation-ai/
├── frontend/          # Next.js application
│   ├── app/          # App router pages
│   ├── public/       # Static assets
│   └── ...
├── backend/          # FastAPI application
│   ├── main.py      # API server
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
# Copy the example file
cp env.example .env
# Or create it manually
```

5. Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-pro
```

**Available Gemini models**:
- `gemini-2.5-pro` (default, most capable)
- `gemini-1.5-pro` (fallback, very capable)
- `gemini-1.5-flash` (faster, cost-effective alternative)
- `gemini-2.0-flash-exp` (experimental, fastest)

6. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file:
```bash
# Copy the example file
cp env.example .env.local
# Or create it manually
```

4. Edit `.env.local` and set the API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "primary_model": "gemini-2.5-pro",
  "fallback_model": "gemini-1.5-pro",
  "api_key_configured": true
}
```

### POST /generate
Generate complaint messages

**Request Body:**
```json
{
  "category": "ecommerce_refund",
  "tone": "firm",
  "title": "Delayed refund for order #12345",
  "description": "I placed an order on...",
  "incident_date": "2024-01-15",
  "location": "Mumbai, India",
  "company_or_institution": "Amazon India",
  "recipient_name": "Customer Support Team",
  "order_or_ticket_id": "#12345",
  "desired_resolution": "Full refund of ₹5,000 within 7 business days",
  "proof_available": true
}
```

**Response:**
```json
{
  "request_id": "uuid",
  "whatsapp_message": "...",
  "email_subject": "...",
  "email_body": "...",
  "escalation_subject": "...",
  "escalation_body": "...",
  "followup_message": "...",
  "tips": ["tip1", "tip2"],
  "required_placeholders": ["DATE", "ORDER_ID"]
}
```

## Deployment

### Backend Deployment (Render/Railway)

1. **On Render:**
   - Create a new Web Service
   - Connect your Git repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables:
     - `GEMINI_API_KEY`
     - `GEMINI_MODEL` (optional, defaults to gemini-2.5-pro)

2. **On Railway:**
   - Create a new project from Git
   - Add environment variables
   - Railway will auto-detect Python and install dependencies

3. **Update CORS:**
   - In `backend/main.py`, update `allow_origins` in CORS middleware to include your frontend URL

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = Your backend API URL
4. Deploy

**Note:** Make sure your backend URL is accessible from the internet (no localhost).

## Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-pro
```

**Alternative models**:
- `GEMINI_MODEL=gemini-1.5-pro` (fallback)
- `GEMINI_MODEL=gemini-1.5-flash` (faster)
- `GEMINI_MODEL=gemini-2.0-flash-exp` (experimental)

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, use your deployed backend URL:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## Features in Detail

### Categories Supported
- College/Hostel Issues
- Internet/Network Problems
- E-commerce Refund
- Banking/UPI Issues
- Rent/Landlord Disputes
- Workplace/HR Issues
- Courier/Delivery Problems
- Hospital/Billing Issues

### Tone Options
- **Polite**: Courteous and respectful, seeking cooperation
- **Firm**: Direct with clear expectations and boundaries
- **Strict**: Formal and demanding, indicating potential consequences

## Troubleshooting

### Backend Issues

1. **"AI models are not available"**
   - Check that `GEMINI_API_KEY` is set correctly
   - Verify your API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Make sure you've enabled the Gemini API in your Google Cloud Console

2. **Import errors**
   - Make sure you've activated the virtual environment
   - Run `pip install -r requirements.txt` again

3. **CORS errors**
   - Update `allow_origins` in `backend/main.py` to include your frontend URL

### Frontend Issues

1. **API connection errors**
   - Verify `NEXT_PUBLIC_API_URL` is correct in `.env.local`
   - Make sure the backend is running
   - Check browser console for detailed error messages

2. **Build errors**
   - Delete `node_modules` and `.next` folder
   - Run `npm install` again
   - Run `npm run build` to check for TypeScript errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, FastAPI, and Google Gemini API

