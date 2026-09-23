from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from openai import OpenAI
import fitz  # PyMuPDF

app = FastAPI(title="SIH AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ResumeData(BaseModel):
    skills: List[str]
    education: List[str]
    projects: List[str]
    certifications: List[str]
    experience: List[str]
    achievements: List[str]

class JDData(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    qualifications: List[str]
    experience: List[str]
    responsibilities: List[str]

def extract_text_from_pdf(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        
        prompt = f"""
        Extract the following information from the resume text and return ONLY a valid JSON object.
        Fields:
        - skills: List of technical and soft skills
        - education: List of degrees and institutions
        - projects: List of projects with brief descriptions
        - certifications: List of certifications
        - experience: List of professional experience
        - achievements: List of awards and achievements

        Resume Text:
        {text}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are a professional resume parser. Output only JSON."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/parse-jd")
async def parse_jd(text: str = Form(...)):
    try:
        prompt = f"""
        Analyze the following job description and return ONLY a valid JSON object.
        Fields:
        - technical_skills: List of required technical skills
        - soft_skills: List of required soft skills
        - qualifications: List of degrees or certifications
        - experience: List of experience requirements
        - responsibilities: List of key responsibilities

        Job Description:
        {text}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are a professional JD analyzer. Output only JSON."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-match")
async def analyze_match(resume_text: str = Form(...), jd_text: str = Form(...)):
    try:
        prompt = f"""
        Compare the resume and the job description. Provide a semantic analysis.
        Return ONLY a JSON object with:
        - matching_skills: skills found in both
        - missing_skills: skills in JD but missing from resume
        - relevant_projects: projects in resume that align with JD
        - improvement_suggestions: specific tips to make the resume better for this role

        Resume: {resume_text}
        JD: {jd_text}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are an expert career coach. Output only JSON."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/career-assistant")
async def career_assistant(query: str = Form(...), context: str = Form(...)):
    try:
        # context should be a JSON string containing student profile, goal, and gaps
        prompt = f"""
        You are a personalized Career Assistant. Use the provided context to answer the student's query.
        If the context contains specific skill gaps or courses, prioritize those in your answer.
        Be encouraging, professional, and data-driven.

        Student Context:
        {context}

        Student Query:
        {query}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are a helpful AI Career Assistant. Give personalized, concise advice based on the data provided."},
                      {"role": "user", "content": prompt}]
        )
        
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
