import React, { useState, useEffect } from "react";
import { Star, MessageCircle, User } from "lucide-react";
import axiosClient from "../api/axiosClient"; // Nhớ trỏ đúng đường dẫn nha mạy

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      try {
        const res = await axiosClient.get(`/reviews/product/${productId}`);
        if (res.data.success) {
          setReviews(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi tải đánh giá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <section className="mt-12 rounded-3xl bg-white p-6 sm:p-10 shadow-[0_10px_40px_rgba(15,23,42,0.04)] border border-slate-100">
      <div className="mb-8 flex flex-col items-center justify-between gap-6 border-b border-slate-100 pb-8 sm:flex-row sm:items-end">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <MessageCircle className="text-emerald-500" size={24} />
            Đánh giá từ thực khách
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Xem những người khác nói gì về món ăn này nhé!
          </p>
        </div>

        {totalReviews > 0 && (
          <div className="flex flex-col items-center sm:items-end">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter text-amber-500">
                {averageRating}
              </span>
              <span className="text-lg font-bold text-slate-400">/ 5</span>
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-100 text-slate-200"
                  }
                />
              ))}
            </div>
            <p className="mt-1 text-xs font-bold text-slate-400">
              Dựa trên {totalReviews} đánh giá
            </p>
          </div>
        )}
      </div>

      {totalReviews === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <Star size={32} />
          </div>
          <p className="text-lg font-bold text-slate-700">
            Chưa có đánh giá nào
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Hãy là người đầu tiên thưởng thức và để lại nhận xét nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <article
              key={review.id_review}
              className="group rounded-2xl bg-slate-50/50 p-5 transition-colors hover:bg-slate-50"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-sm uppercase">
                    {review.full_name ? (
                      review.full_name.charAt(0)
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-none">
                      {review.full_name || "Khách hàng ẩn danh"}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                      {new Date(review.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      }
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed text-slate-600 ml-13">
                  {review.comment}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
