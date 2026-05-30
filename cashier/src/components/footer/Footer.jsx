export default function Footer({ session }) {
  return (
    <div className="footer">
      <div className="footer-left">
        <div className="footer-label">Teller No</div>
        <div className="footer-value">{session?.tellerNo ?? '--'}</div>
      </div>

      <div className="footer-center">
        <div className="footer-label">Outlet/Branch</div>
        <div className="footer-value">{session?.outlet ?? '--'}</div>
      </div>

      <div className="footer-right">
        <div className="footer-value strong">{session?.tellerName ?? '--'}</div>
      </div>
    </div>
  );
}
