export type AssessmentSubmission = {
  questionKey: string;
  studentCode: string;
  answer: string;
};

export async function submitAssessmentResponse(
  submission: AssessmentSubmission
): Promise<void> {
  const response = await fetch("/api/assessment-responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo guardar la respuesta (HTTP ${response.status}).`
    );
  }
}
