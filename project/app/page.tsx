import { Shop } from "@/components/Shop";

export default function Home() {
  return (
    <>
      <a className="skip" href="#inventory">Skip to inventory</a>
      <header className="site-header">
        <div className="wrap bar">
          <a className="brand" href="#top" aria-label="Kestrel Motor Co. home">
            <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M2 20 L14 6 L12 14 L30 4 L19 15 L24 18 L12 17 L8 26 Z" fill="currentColor" /></svg>
            <span>Kestrel<small>Motor Co.</small></span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#inventory">Inventory</a>
            <a href="#how">How it works</a>
            <a href="#visit">Visit</a>
          </nav>
        </div>
      </header>
      <main>
        <Shop />
        <section className="how" id="how" aria-labelledby="how-title">
          <div className="wrap">
            <p className="eyebrow dark">The Kestrel way</p>
            <h2 id="how-title">Three promises on every car.</h2>
            <ol className="promises">
              <li><span className="mono">01</span><h3>164-point inspection</h3><p>Brakes, battery health, frame and software are checked by two technicians. The report is attached to every listing.</p></li>
              <li><span className="mono">02</span><h3>One honest price</h3><p>The figure you see is the figure you pay, before tax and licensing. No add-on fees, no surprise paperwork.</p></li>
              <li><span className="mono">03</span><h3>7-day return window</h3><p>Drive it for a week or 500 km. If it is not right, bring it back for a full refund.</p></li>
            </ol>
          </div>
        </section>
      </main>
      <footer className="site-footer" id="visit">
        <div className="wrap foot">
          <div><strong>Kestrel Motor Co.</strong><p>1180 Dufferin Works Road, Toronto, ON</p><p>Mon–Fri 9–8 · Sat 9–6 · Sun 11–5</p></div>
          <p className="fine">Demo experience. Vehicles, prices and the dealership are fictional and for illustration only.</p>
        </div>
      </footer>
    </>
  );
}
