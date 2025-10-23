# 🎯 Interview Question Generator
## Virtual Wizards AI Tool

A simple, powerful web app that generates tailored interview questions from job descriptions and CVs using AI. Perfect for recruiters, hiring managers, and HR professionals.

## ✨ Features

- **AI-Powered Question Generation**: Uses OpenAI GPT-4o-mini to create tailored interview questions
- **Simple Text Input**: Paste CV content directly - no file uploads needed
- **Mobile-Responsive Design**: Clean, modern UI that works on all devices
- **Export Functionality**: Copy questions or export to text files
- **Rate Limiting**: Built-in protection against abuse
- **Secure**: API key never exposed to users
- **Real-time Validation**: Character count and input validation

## 🏗️ Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Backend**: Vercel Edge Functions (serverless)
- **AI**: OpenAI GPT-4o-mini with JSON response format
- **Text Processing**: Direct text input processing
- **Deployment**: Vercel (serverless)

## 📁 Project Structure

```
/
├── index.html                   # Main app page
├── styles.css                   # App styles
├── script.js                    # App functionality
├── /api
│   └── generate-questions.ts    # Vercel Edge Function
├── package.json
├── vercel.json                  # Vercel configuration
├── SETUP.md                     # Dummy-proof setup guide
└── README.md
```

## 🚀 **SUPER EASY SETUP** (No Coding Required!)

### **Option 1: One-Click Deploy (Recommended)**

1. **Fork this repository** on GitHub
2. **Connect to Vercel**: https://vercel.com/new
3. **Import your forked repo**
4. **Add environment variable**: `OPENAI_API_KEY` = your OpenAI key
5. **Deploy!** ✨

### **Option 2: Manual Setup**

Follow the **SETUP.md** file for a complete dummy-proof guide.

### **What You Need:**
- GitHub account (free)
- Vercel account (free) 
- OpenAI API key (~$5-10/month)

## 🔧 Configuration

### CORS Settings

Update the allowed origins in `/api/generate-questions.ts`:

```typescript
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',        // Your production domain
  'http://localhost:3000',         // Local development
  'http://localhost:5173',         // Alternative local port
  'http://localhost:8080',         // Alternative local port
  // 'https://codepen.io',         // Uncomment for CodePen testing
];
```

### Rate Limiting

The API includes basic rate limiting (10 requests per minute per IP). For production, consider upgrading to Vercel KV:

```typescript
// Current: In-memory rate limiting
const rateLimitMap = new Map<string, { tokens: number; lastRefill: number }>();

// Production: Use Vercel KV
// import { kv } from '@vercel/kv';
```

### File Size Limits

Current limits (configurable in the API):
- Job Description: 150KB
- CV Text: 150KB

## 📱 Embedding the Widget

### Basic Embed

Add this to any HTML page:

```html
<div id="vw-interview-widget"></div>
<script src="https://yourdomain.com/widget.js"></script>
```

### CodePen Integration

1. **Upload files to CodePen**:
   - Create a new pen
   - Upload `widget.html`, `widget.css`, and `widget.js`
   - Update the API endpoint in `widget.js` to your deployed URL

2. **Update CORS settings**:
   ```typescript
   const ALLOWED_ORIGINS = [
     'https://yourdomain.com',
     'https://codepen.io',  // Add this for CodePen
     // ... other origins
   ];
   ```

3. **Get embed code**:
   ```html
   <div id="vw-interview-widget"></div>
   <script src="https://yourdomain.com/widget.js"></script>
   ```

## 🧪 Testing

### Local Testing

1. Start the development server: `npm run dev`
2. Open `http://localhost:3000/public/widget.html`
3. Test with sample data:
   - **Role**: Software Engineer
   - **Seniority**: Mid
   - **JD**: Paste a job description
   - **CV**: Upload a PDF or text file

### Production Testing

1. Deploy to Vercel: `vercel --prod`
2. Test the deployed URL
3. Verify CORS settings work with your domain
4. Test file upload limits and error handling

## 🔒 Security Features

- **API Key Protection**: OpenAI key never exposed to client
- **CORS Restrictions**: Only allowed domains can access the API
- **Rate Limiting**: Prevents abuse with token bucket algorithm
- **Input Validation**: File size and content validation
- **Error Handling**: Secure error messages without stack traces

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**:
   ```
   Error: CORS: Origin not allowed
   ```
   **Solution**: Add your domain to `ALLOWED_ORIGINS` in the API file

2. **Rate Limit Exceeded**:
   ```
   Error: Rate limit exceeded. Please try again later.
   ```
   **Solution**: Wait 1 minute or implement Vercel KV for better rate limiting

3. **File Too Large**:
   ```
   Error: File size exceeds 150KB limit
   ```
   **Solution**: Reduce file size or increase limits in the API

4. **OpenAI API Errors**:
   ```
   Error: Service configuration error
   ```
   **Solution**: Check your `OPENAI_API_KEY` environment variable

5. **PDF Parsing Errors**:
   ```
   Error: Failed to parse PDF file
   ```
   **Solution**: Ensure the PDF is not password-protected and is a valid PDF

### Debug Mode

Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 📊 API Reference

### POST /api/generate-questions

**Request Body**:
```json
{
  "role": "Software Engineer",
  "seniority": "mid",
  "jdText": "Job description text...",
  "cvText": "CV text content..."
}
```

**Response**:
```json
{
  "role": "Software Engineer",
  "seniority": "mid",
  "categories": [
    {
      "name": "Technical",
      "questions": [
        {
          "q": "Describe your experience with React and TypeScript.",
          "why_it_matters": "Shows technical competency for the role.",
          "what_good_sounds_like": "Specific examples, best practices, challenges overcome."
        }
      ]
    }
  ],
  "bonus": {
    "red_flags": ["No version control experience"],
    "homework_prompt": "Build a simple todo app with React and TypeScript."
  }
}
```

## 🚀 Deployment Checklist

- [ ] Set `OPENAI_API_KEY` environment variable in Vercel
- [ ] Update `ALLOWED_ORIGINS` with your production domain
- [ ] Test the deployed application
- [ ] Verify CORS settings work
- [ ] Test file upload functionality
- [ ] Check rate limiting behavior
- [ ] Update widget.js API endpoint URL

## 📈 Performance Optimization

- **Edge Runtime**: Uses Vercel Edge Functions for faster response times
- **Client-Side PDF Parsing**: Reduces server load
- **Rate Limiting**: Prevents API abuse
- **Response Caching**: Consider implementing for repeated requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Test with the provided sample data
4. Check Vercel deployment logs

---

**Built with ❤️ using OpenAI, Vercel, and modern web technologies.**
