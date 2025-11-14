import { useEffect, useState } from "react";

const Card = ({ label, value, sub }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
    <div className="text-sm text-white/70">{label}</div>
    <div className="mt-1 text-3xl font-bold">{value}</div>
    {sub ? <div className="text-xs text-white/60 mt-1">{sub}</div> : null}
  </div>
);

const Analytics = () => {
  const [stats, setStats] = useState({
    tutors: 0,
    partners: 0,
    testimonials: 0,
    services: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const toJson = async (resp) => (await resp.json()).data || [];
        const [tutorsR, partnersR, testimonialsR, servicesR] = await Promise.all([
          fetch("/api/tutors/?limit=1"),
          fetch("/api/partners/?limit=1"),
          fetch("/api/testimonials/?limit=1"),
          fetch("/api/other-services/?limit=1"),
        ]);
        const [tutors, partners, testimonials, services] = await Promise.all([
          toJson(tutorsR),
          toJson(partnersR),
          toJson(testimonialsR),
          toJson(servicesR),
        ]);
        if (!isMounted) return;
        setStats({
          tutors: Array.isArray(tutors) ? tutors.length : 0,
          partners: Array.isArray(partners) ? partners.length : 0,
          testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
          services: Array.isArray(services) ? services.length : 0,
        });
        setError(null);
      } catch (e) {
        if (!isMounted) return;
        setError("Failed to load analytics");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="container mx-auto px-4 lg:px-6 mt-12">
      <h3 className="text-2xl font-bold mb-4">Platform at a glance</h3>
      {error && (
        <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Active Tutors" value={loading ? "—" : stats.tutors} />
        <Card label="Partners" value={loading ? "—" : stats.partners} />
        <Card label="Testimonials" value={loading ? "—" : stats.testimonials} />
        <Card label="Other Services" value={loading ? "—" : stats.services} />
      </div>
    </section>
  );
};

export default Analytics;



