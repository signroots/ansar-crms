import React from 'react';
import FeedbackList from '../components/feedbackmanagement/feedbacklist';  // Corrected import

function FeedbackPage() {
  return (
    <div>
      <FeedbackList />  {/* Corrected to use the FeedbackList component */}
    </div>
  );
}

export default FeedbackPage;