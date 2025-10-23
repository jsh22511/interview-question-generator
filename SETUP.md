# 🚀 **DUMMY-PROOF SETUP GUIDE**
## Interview Question Generator for Virtual Wizards

This guide will get your AI-powered interview question generator live on the internet in under 10 minutes. No coding experience required!

---

## 📋 **What You'll Need**
- A GitHub account (free)
- A Vercel account (free)
- An OpenAI API key (costs ~$5-10/month for normal usage)

---

## 🎯 **Step 1: Get Your OpenAI API Key (5 minutes)**

1. **Go to**: https://platform.openai.com/api-keys
2. **Click**: "Create new secret key"
3. **Name it**: "Interview Generator"
4. **Copy the key** (starts with `sk-...`) - **SAVE THIS!**
5. **Set a usage limit**: Go to https://platform.openai.com/usage/limits and set a monthly limit of $20

---

## 🐙 **Step 2: Upload to GitHub (3 minutes)**

1. **Go to**: https://github.com/new
2. **Repository name**: `interview-question-generator`
3. **Make it Public** (so Vercel can access it)
4. **Click**: "Create repository"

5. **Upload files** (drag and drop these files into GitHub):
   - `index.html`
   - `styles.css`
   - `script.js`
   - `api/generate-questions.ts`
   - `package.json`
   - `vercel.json`
   - `.gitignore`

6. **Commit message**: "Initial upload"
7. **Click**: "Commit changes"

---

## ⚡ **Step 3: Deploy to Vercel (2 minutes)**

1. **Go to**: https://vercel.com/new
2. **Click**: "Import Git Repository"
3. **Find your repo**: `interview-question-generator`
4. **Click**: "Import"

5. **Set Environment Variable**:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Paste your OpenAI key from Step 1
   - **Click**: "Add"

6. **Click**: "Deploy"

7. **Wait 2 minutes** for deployment to complete

---

## 🎉 **Step 4: You're Live!**

Your app will be available at: `https://interview-question-generator.vercel.app`

**Test it**:
1. Open the URL
2. Fill in the form with sample data
3. Upload a PDF or text file
4. Click "Generate Questions"
5. Watch the magic happen! ✨

---

## 🔧 **Optional: Connect to Your Domain**

If you want it on your Virtual Wizards domain:

1. **In Vercel dashboard**: Go to your project → Settings → Domains
2. **Add domain**: `interview.virtualwizards.com` (or whatever you want)
3. **Update DNS**: Add a CNAME record pointing to your Vercel domain
4. **Wait 5 minutes** for DNS to propagate

---

## 🆘 **Troubleshooting**

### **"CORS Error"**
- Your domain isn't in the allowed list
- Contact support to add your domain

### **"API Key Error"**
- Check that `OPENAI_API_KEY` is set in Vercel
- Make sure you copied the key correctly

### **"Rate Limit"**
- Wait 1 minute and try again
- You're making too many requests

### **"File Too Large"**
- Your PDF/text file is over 150KB
- Try a smaller file or compress the PDF

---

## 💰 **Cost Breakdown**

- **Vercel**: FREE (generous limits)
- **OpenAI**: ~$0.01-0.05 per question generation
- **Total**: Less than $10/month for normal usage

---

## 🎯 **What You Get**

✅ **AI-powered interview questions** tailored to job descriptions and CVs  
✅ **PDF parsing** - upload any CV and it extracts the text  
✅ **Mobile-friendly** - works on phones and tablets  
✅ **Export functionality** - copy or download questions  
✅ **Professional design** - branded for Virtual Wizards  
✅ **Secure** - your API key is never exposed to users  

---

## 📞 **Need Help?**

If you get stuck:
1. Check the troubleshooting section above
2. Make sure all files are uploaded to GitHub
3. Verify your OpenAI API key is working
4. Contact support with specific error messages

**You've got this!** 🚀
