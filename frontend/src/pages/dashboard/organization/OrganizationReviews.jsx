import { useCallback, useEffect, useState } from 'react';
import { organizationApi } from '@/api';
import { useToast } from '@/hooks';
import { avatarUrl, formatDate, logoUrl } from '@/utils';

const cardClass = 'bg-white border border-slate-200 rounded-2xl shadow-sm';
const primaryBtn = 'inline-flex items-center justify-center rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryBtn = 'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50';
const dangerBtn = 'inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100';
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all';

function PageSection({ title, subtitle, children }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className={`${cardClass} p-5`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export default function OrganizationReviews() {
  const { success, error } = useToast();
  const [organization, setOrganization] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openReplyIds, setOpenReplyIds] = useState([]);
  const [savingApproveId, setSavingApproveId] = useState(null);
  const [savingReplyId, setSavingReplyId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const mine = await organizationApi.getMine();
      const org = mine.data.organization;
      setOrganization(org);
      const res = await organizationApi.getOwnerReviews(org.id);
      const nextReviews = res.data.reviews || [];
      setReviews(nextReviews);
      setReplyDrafts(Object.fromEntries(nextReviews.map((review) => [review.id, review.owner_reply || ''])));
    } catch {
      setOrganization(null);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const approveReview = async (reviewId) => {
    if (!organization?.id) return;
    setSavingApproveId(reviewId);
    try {
      await organizationApi.approveReview(organization.id, reviewId);
      success('Review visibility updated');
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update review');
    } finally {
      setSavingApproveId(null);
    }
  };

  const saveReply = async (reviewId) => {
    if (!organization?.id) return;
    setSavingReplyId(reviewId);
    try {
      await organizationApi.replyToReview(organization.id, reviewId, { owner_reply: replyDrafts[reviewId] || '' });
      success(replyDrafts[reviewId]?.trim() ? 'Reply saved' : 'Reply removed');
      setOpenReplyIds((prev) => prev.filter((id) => id !== reviewId));
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save reply');
    } finally {
      setSavingReplyId(null);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!organization?.id) return;
    setDeletingReviewId(reviewId);
    try {
      await organizationApi.deleteReview(organization.id, reviewId);
      success('Review deleted');
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20 text-sm text-slate-500">Loading reviews...</div>;
  }

  return (
    <PageSection title="Organization Reviews" subtitle="Moderate visibility and post official replies, like the university review workflow.">
      <Panel title="Incoming Reviews" description={`${reviews.length} review(s) submitted for this organization.`}>
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            No reviews yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const replyOpen = openReplyIds.includes(review.id);
              return (
                <div key={review.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">
                          {review.Author?.avatar_url ? (
                            <img src={avatarUrl(review.Author.avatar_url) || review.Author.avatar_url} alt={review.Author?.name || 'Reviewer'} className="h-full w-full object-cover" />
                          ) : (
                            <span>{(review.Author?.name || 'U').slice(0, 1).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-base font-semibold text-slate-800">{review.Author?.name || 'Unknown user'}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{formatDate(review.createdAt || review.created_at)} • {review.rating}/5</p>
                            </div>
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${review.is_approved ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                              {review.is_approved ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                          {review.title ? <p className="mt-2 text-sm font-semibold text-slate-700">{review.title}</p> : null}
                          {review.content ? <p className="mt-2 text-sm leading-6 text-slate-600">{review.content}</p> : null}
                        </div>
                      </div>
                      {review.owner_reply ? (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600">
                              {organization?.logo_url ? (
                                <img src={logoUrl(organization.logo_url) || organization.logo_url} alt={organization.name} className="h-full w-full object-cover" />
                              ) : (
                                <span>{(organization?.name || 'O').slice(0, 1).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{organization?.name}</p>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{review.owner_reply}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      {replyOpen ? (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                          <textarea className={`${inputClass} resize-y`} rows={3} value={replyDrafts[review.id] || ''} onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))} placeholder="Write an official reply..." />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" onClick={() => saveReply(review.id)} disabled={savingReplyId === review.id} className={primaryBtn}>{savingReplyId === review.id ? 'Saving...' : 'Save Reply'}</button>
                            <button type="button" onClick={() => setOpenReplyIds((prev) => prev.filter((id) => id !== review.id))} className={secondaryBtn}>Cancel</button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      <button type="button" onClick={() => setOpenReplyIds((prev) => prev.includes(review.id) ? prev.filter((id) => id !== review.id) : [...prev, review.id])} className={secondaryBtn}>
                        {replyOpen ? 'Close Reply' : review.owner_reply ? 'Edit Reply' : 'Reply'}
                      </button>
                      <button type="button" onClick={() => approveReview(review.id)} disabled={savingApproveId === review.id} className={review.is_approved ? secondaryBtn : primaryBtn}>
                        {savingApproveId === review.id ? 'Saving...' : review.is_approved ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" onClick={() => deleteReview(review.id)} disabled={deletingReviewId === review.id} className={dangerBtn}>
                        {deletingReviewId === review.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </PageSection>
  );
}
