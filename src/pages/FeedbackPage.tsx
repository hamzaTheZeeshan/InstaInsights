import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import './FeedbackPage.css';

const RATINGS = [1, 2, 3, 4, 5];
const CATEGORIES = ['General', 'Analytics', 'Search', 'Design', 'Performance', 'Bug Report'];
const FORMSPREE_URL = 'https://formspree.io/f/mqevqrdo';

export default function FeedbackPage() {
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleCategory = (c: string) => {
    setCategories(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: `${rating} / 5 stars`,
          email: email || 'Not provided',
          categories: categories.length > 0 ? categories.join(', ') : 'Not selected',
          message: message || 'No message provided',
        }),
      });

      if (!res.ok) throw new Error('Submission failed.');
      setSubmitted(true);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="feedback-page">
          <div className="feedback-success">
            <div className="feedback-success-icon">🎉</div>
            <h2 className="feedback-success-title">Thank you!</h2>
            <p className="feedback-success-text">
              Your feedback means a lot to us. We'll use it to keep improving InstaInsights.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="feedback-page">
        <div className="feedback-header">
          <h1 className="feedback-title">Leave a Review</h1>
          <p className="feedback-subtitle">Help us improve InstaInsights — your feedback goes directly to the creators.</p>
        </div>

        <div className="feedback-card">

          {/* Star rating */}
          <div className="feedback-section">
            <p className="feedback-label">How would you rate your experience? <span className="feedback-required">*</span></p>
            <div className="feedback-stars">
              {RATINGS.map(r => (
                <button
                  key={r}
                  className={`star-btn ${(hovered ?? rating ?? 0) >= r ? 'star-btn--active' : ''}`}
                  onMouseEnter={() => setHovered(r)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setRating(r)}
                >
                  ★
                </button>
              ))}
            </div>
            {rating && (
              <p className="feedback-rating-label">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="feedback-section">
            <p className="feedback-label">Your email</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="feedback-input"
            />
            <p className="feedback-hint">We'll only use this to follow up on your feedback.</p>
          </div>

          {/* Categories */}
          <div className="feedback-section">
            <p className="feedback-label">
              What's your feedback about?{' '}
              <span className="feedback-hint-inline">(select all that apply)</span>
            </p>
            <div className="feedback-categories">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className={`category-btn ${categories.includes(c) ? 'category-btn--active' : ''}`}
                >
                  {categories.includes(c) ? '✓ ' : ''}{c}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="feedback-section">
            <p className="feedback-label">Tell us more (optional)</p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="What did you love? What could be better?"
              className="feedback-textarea"
              rows={4}
            />
          </div>

          {/* Error */}
          {submitError && (
            <p className="feedback-error">{submitError}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!rating || isSubmitting}
            className={`feedback-submit ${!rating || isSubmitting ? 'feedback-submit--disabled' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>

          {!rating && (
            <p className="feedback-submit-hint">Please select a star rating to submit.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}