import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuestions, submitAssessment } from '../api/skillApi';
import { useAuth } from '../hooks/useAuth';
import { ChevronRight, CheckCircle, Award } from 'lucide-react';

const SkillAssessment = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions(skillId);
        setQuestions(data);
      } catch (err) {
        console.error('Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [skillId]);

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = { questionId: questions[currentStep].id, answerIndex: optionIndex };
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // We need the studentId. In a real app, we'd fetch the student profile first.
      // For now, we'll assume we have it or the backend handles it via JWT.
      // Let's fix the backend to use req.user.id to find the student.
      const data = await submitAssessment({
        skillId,
        answers,
      });
      setResult(data.score);
    } catch (err) {
      console.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !result) return <div className="min-h-screen flex items-center justify-center">Loading Assessment...</div>;
  if (!questions.length) return <div className="min-h-screen flex items-center justify-center">No questions found for this skill.</div>;

  if (result !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-yellow-100 rounded-full text-yellow-600">
              <Award size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Assessment Complete!</h2>
          <p className="text-slate-500 mb-8">Your performance has been analyzed.</p>
          <div className="text-6xl font-black text-indigo-600 mb-8">
            {result}%
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-indigo-600 text-white p-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Skill Assessment</h1>
            <p className="text-slate-500">Question {currentStep + 1} of {questions.length}</p>
          </div>
          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-medium text-slate-800 mb-8">
            {questions[currentStep].questionText}
          </h2>
          <div className="space-y-3">
            {questions[currentStep].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  answers[currentStep]?.answerIndex === idx 
                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' 
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{option}</span>
                  {answers[currentStep]?.answerIndex === idx && <CheckCircle size={20} className="text-indigo-600" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-6 py-2 text-slate-600 font-medium disabled:opacity-30"
          >
            Previous
          </button>
          {currentStep === questions.length - 1 ? (
            <button 
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Submit Assessment
            </button>
          ) : (
            <button 
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-white text-indigo-600 border border-indigo-600 px-8 py-2 rounded-xl font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillAssessment;
