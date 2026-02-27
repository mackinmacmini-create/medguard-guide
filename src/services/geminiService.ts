import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DrugInfo {
  name: string;
  class: string;
  indications: string[];
  contraindications: {
    allergies: string[];
    medicalHistory: string[];
    healthStatus: string[];
    ethnicFactors: string[];
  };
  vitalAlerts: string[];
  clinicalChecklist: string[];
  administration: {
    routes: string[];
    frequency: string;
    ivProcedures?: string;
    liquidNotes?: string;
  };
  reactions: {
    common: string[];
    adverse: string[];
  };
  emergencyProtocols: string;
}

export interface PatientProfile {
  id?: string;
  profileName?: string;
  age: string;
  weight: string;
  ethnicity: string;
  allergies: string;
  medicalHistory: string;
  currentMedications: string;
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
  spo2: string;
  temperature: string;
  standingCondition: string;
}

export interface FeedbackResult {
  isError: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  analysis: string;
  recommendations: string[];
}

export async function getMedicationFeedback(
  drugName: string, 
  administrationDetails: string, 
  patient: PatientProfile
): Promise<FeedbackResult | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a medical safety assistant, analyze the following medication administration for potential errors or mistakes.
      
      DRUG: ${drugName}
      ADMINISTRATION DETAILS: ${administrationDetails}
      
      PATIENT PROFILE:
      - Age: ${patient.age}, Weight: ${patient.weight}
      - Vitals: BP ${patient.bloodPressure}, HR ${patient.heartRate}, SpO2 ${patient.spo2}
      - History: ${patient.medicalHistory}
      - Allergies: ${patient.allergies}
      - Current Meds: ${patient.currentMedications}
      
      Identify if there was a mistake in dose, route, frequency, or if there's a contraindication.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isError: { type: Type.BOOLEAN },
            severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
            analysis: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["isError", "severity", "analysis", "recommendations"]
        }
      }
    });
    return JSON.parse(response.text) as FeedbackResult;
  } catch (error) {
    console.error("Error getting feedback:", error);
    return null;
  }
}

export async function getDrugAnalysis(drugName: string, patient: PatientProfile): Promise<DrugInfo | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed medical reference for the drug: ${drugName}. 
      
      CRITICAL PATIENT ANALYSIS REQUIRED:
      Analyze potential contraindications, safety concerns, and dosage adjustments for a patient with the following profile:
      
      VITAL SIGNS & DEMOGRAPHICS:
      - Age: ${patient.age}
      - Weight: ${patient.weight}
      - Blood Pressure: ${patient.bloodPressure}
      - Heart Rate: ${patient.heartRate}
      - Respiratory Rate: ${patient.respiratoryRate}
      - SpO2: ${patient.spo2}
      - Temperature: ${patient.temperature}
      
      CLINICAL BACKGROUND:
      - Ethnicity/Genetic Background: ${patient.ethnicity}
      - Standing Health Condition: ${patient.standingCondition}
      - Known Allergies: ${patient.allergies}
      - Medical History: ${patient.medicalHistory}
      - Current Medications: ${patient.currentMedications}
      
      Focus on safety, drug-drug interactions, and specific contraindications for nursing staff based on these specific vitals and clinical factors.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            class: { type: Type.STRING },
            indications: { type: Type.ARRAY, items: { type: Type.STRING } },
            contraindications: {
              type: Type.OBJECT,
              properties: {
                allergies: { type: Type.ARRAY, items: { type: Type.STRING } },
                medicalHistory: { type: Type.ARRAY, items: { type: Type.STRING } },
                healthStatus: { type: Type.ARRAY, items: { type: Type.STRING } },
                ethnicFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["allergies", "medicalHistory", "healthStatus", "ethnicFactors"]
            },
            vitalAlerts: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Specific safety alerts based on the patient's provided vital signs (BP, HR, etc.)"
            },
            clinicalChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A checklist of clinical factors to verify before administration based on this patient's profile."
            },
            administration: {
              type: Type.OBJECT,
              properties: {
                routes: { type: Type.ARRAY, items: { type: Type.STRING } },
                frequency: { type: Type.STRING },
                ivProcedures: { type: Type.STRING },
                liquidNotes: { type: Type.STRING },
              },
              required: ["routes", "frequency"]
            },
            reactions: {
              type: Type.OBJECT,
              properties: {
                common: { type: Type.ARRAY, items: { type: Type.STRING } },
                adverse: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["common", "adverse"]
            },
            emergencyProtocols: { type: Type.STRING, description: "Step-by-step instructions for adverse reactions or complications." },
          },
          required: ["name", "class", "indications", "contraindications", "vitalAlerts", "clinicalChecklist", "administration", "reactions", "emergencyProtocols"]
        },
      },
    });

    return JSON.parse(response.text) as DrugInfo;
  } catch (error) {
    console.error("Error fetching drug analysis:", error);
    return null;
  }
}
