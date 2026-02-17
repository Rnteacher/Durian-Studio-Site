import { Heart, Shield, Star, Rocket } from "lucide-react";

const values = [
  { icon: Heart, title: "קהילה", description: "אנחנו מאמינים בכוח של קהילה ותמיכה הדדית" },
  { icon: Shield, title: "אחריות", description: "לוקחים אחריות על כל פרויקט ומחויבים לאיכות" },
  { icon: Star, title: "מקצועיות", description: "עובדים ברמה מקצועית גבוהה למרות הגיל הצעיר" },
  { icon: Rocket, title: "יזמות צעירה", description: "מפתחים כישורים עסקיים ויצירתיים מגיל צעיר" },
];

export default function About() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-rubik text-4xl md:text-5xl font-extrabold text-heading mb-6">
            מי אנחנו?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            סטודיו דוריאן הוא יוזמת נוער יצירתית שנולדה מתוך תיכון{" "}
            <strong className="text-foreground">״החממה״</strong> בהוד השרון. אנחנו קבוצה של
            חניכים מוכשרים שמציעים שירותים יצירתיים וטכניים לעמותות ולעסקים קטנים — בהתנדבות
            או בתשלום סמלי.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-soft-bg/40">
        <div className="container mx-auto px-4">
          <h2 className="font-rubik text-3xl font-bold text-heading text-center mb-12">
            הערכים שלנו
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-card rounded-2xl p-6 shadow-sm text-center hover-scale"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-rubik text-lg font-bold text-heading mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Behind the scenes */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-rubik text-3xl font-bold text-heading text-center mb-10">
            מאחורי הקלעים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-soft-bg flex items-center justify-center text-muted-foreground"
              >
                <span className="text-sm">תמונה {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
