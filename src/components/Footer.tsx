import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-heading text-primary-foreground py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-rubik text-xl font-bold mb-3">סטודיו דוריאן</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              יוזמת נוער יצירתית מתוך תיכון החממה בהוד השרון.
              <br />
              כישרונות צעירים, שירותים אמיתיים.
            </p>
          </div>
          <div>
            <h4 className="font-rubik font-semibold mb-3">ניווט</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <Link href="/" className="hover:opacity-100 transition-opacity">בית</Link>
              <Link href="/students" className="hover:opacity-100 transition-opacity">החניכים שלנו</Link>
              <Link href="/about" className="hover:opacity-100 transition-opacity">אודות</Link>
              <Link href="/contact" className="hover:opacity-100 transition-opacity">יצירת קשר</Link>
            </div>
          </div>
          <div>
            <h4 className="font-rubik font-semibold mb-3">צרו קשר</h4>
            <p className="text-sm opacity-80">studio@chamama.org</p>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-xs opacity-60">
          © {new Date().getFullYear()} תיכון החממה. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
