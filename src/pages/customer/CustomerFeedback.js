import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiStar, HiArrowLeft } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { notificationsAPI } from '../../api/axios';

function StarRating({ label, value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              color: star <= (hovered || value) ? '#f97316' : 'var(--color-border)',
              transition: 'color 0.15s',
            }}
          >
            <HiStar size={28} />
          </button>
        ))}
        {value > 0 && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', alignSelf: 'center', marginLeft: 4 }}>
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CustomerFeedback() {
  const navigate = useNavigate();
  const token = localStorage.getItem('queueToken');

  useEffect(() => {
    if (!token) {
      toast('No active visit found. Please join a queue first.', 'error');
      navigate('/customer/home', { replace: true });
    }
  }, [token, navigate]);

  const [ratings, setRatings] = useState({ overall: 0, wait: 0, food: 0, service: 0 });
  const [recommend, setRecommend] = useState(null);
  const [comment, setComment]     = useState('');
  const [loading, setLoading]     = useState(false);

  const setRating = (key) => (val) => setRatings(r => ({ ...r, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ratings.overall || !ratings.wait || !ratings.food || !ratings.service) {
      toast('Please rate all 4 categories', 'error');
      return;
    }
    setLoading(true);
    try {
      await notificationsAPI.submitFeedback({
        token_number:      token,
        overall_rating:    ratings.overall,
        wait_satisfaction: ratings.wait,
        food_rating:       ratings.food,
        service_rating:    ratings.service,
        would_recommend:   recommend,
        comment,
      });
      toast('Thank you for your feedback! 🎉', 'success');
      localStorage.removeItem('queueToken');
      localStorage.removeItem('queueRestaurantId');
      navigate('/customer/home');
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to submit feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px', minHeight: '100vh' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
            <HiArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Leave Feedback</h1>
        </div>

        <div className="card anim-scale-in" style={{ marginBottom: 16, textAlign: 'center', padding: '20px 24px' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>How was your experience?</p>
          <p className="text-muted text-sm">Token: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{token}</span></p>
        </div>

        <div className="card anim-fade-up">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <StarRating label="Overall Experience"  value={ratings.overall} onChange={setRating('overall')} />
            <StarRating label="Wait Time Satisfaction" value={ratings.wait}  onChange={setRating('wait')} />
            <StarRating label="Food Quality"         value={ratings.food}    onChange={setRating('food')} />
            <StarRating label="Service"              value={ratings.service} onChange={setRating('service')} />

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>Would you recommend us?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ val: true, label: '👍 Yes' }, { val: false, label: '👎 No' }].map(({ val, label }) => (
                  <button key={String(val)} type="button"
                    onClick={() => setRecommend(v => v === val ? null : val)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.875rem', transition: 'var(--transition)',
                      border: `2px solid ${recommend === val ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: recommend === val ? 'var(--color-primary-muted)' : 'var(--color-bg-input)',
                      color: recommend === val ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Comments (optional)
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                maxLength={1000}
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)', background: 'var(--color-bg-input)',
                  color: 'var(--color-text)', fontSize: '0.9375rem', resize: 'vertical',
                  fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <Button type="submit" loading={loading}>Submit Feedback</Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
