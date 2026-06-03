package com.iponchallenge.config;

import com.iponchallenge.entity.FinancialLesson;
import com.iponchallenge.repository.FinancialLessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Seeds the financial_lessons table on startup if it is empty. */
@Component
@RequiredArgsConstructor
public class LessonDataSeeder implements ApplicationRunner {

    private final FinancialLessonRepository lessonRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (lessonRepository.count() > 0) return;
        lessonRepository.saveAll(buildLessons());
    }

    private List<FinancialLesson> buildLessons() {
        return List.of(
            lesson(1, "Make Your Baon Last the Week", "ALLOWANCE", "BEGINNER", "💰", 5, false,
                "Tips to stretch your allowance every single week.",
                """
                [
                  {"type":"intro","text":"Running out of baon by Wednesday? You're not alone. Here's how to make every peso count until Friday."},
                  {"type":"tips","title":"5 Rules to Last the Week","items":[
                    "Divide your allowance on Monday morning — allocate for food, transport, and school before spending anything.",
                    "Avoid impulse buying. Ask yourself: do I need this today or just want it?",
                    "Track every ₱20 you spend. Small amounts add up fast.",
                    "Keep a ₱100–₱200 emergency reserve. Don't touch it unless necessary.",
                    "Meal prep or find a cheap suki. Food is usually your biggest spend."
                  ]},
                  {"type":"example","title":"Sample Weekly Budget (₱1,000 baon)","text":"Food: ₱500 • Transport: ₱200 • School: ₱100 • Load/Data: ₱100 • Emergency: ₱100"},
                  {"type":"callout","tone":"positive","text":"Students who divide their allowance on day 1 are 3× more likely to have money left by the end of the week."},
                  {"type":"quiz","question":"What is the most important first step when you receive your allowance?","options":["Buy what you want immediately","Divide it into categories first","Save all of it","Lend it to friends"],"correctIndex":1,"explanation":"Allocating your money before spending is the #1 habit of students who never run out of baon."}
                ]
                """),

            lesson(2, "Understanding Compound Interest", "SAVINGS", "INTERMEDIATE", "📈", 8, true,
                "How your money grows — and how debt snowballs.",
                """
                [
                  {"type":"intro","text":"Compound interest is money earning money on itself. It works for you when you save, and against you when you borrow."},
                  {"type":"tips","title":"How it Works","items":[
                    "Simple interest: ₱1,000 × 5% = ₱50/year every year.",
                    "Compound interest: ₱1,000 × 5%, reinvested — after 10 years you have ₱1,629, not ₱1,500.",
                    "The earlier you start saving, the more compounding works in your favour.",
                    "Credit card debt compounds too — usually at 3–4% per month (36–48% per year)."
                  ]},
                  {"type":"example","title":"₱500/month for 5 years at 4% annual interest","text":"Total deposited: ₱30,000 • Interest earned: ₱3,300+ • Final value: ₱33,300+"},
                  {"type":"callout","tone":"warning","text":"A ₱5,000 credit card balance at 3.5%/month becomes ₱10,000+ in less than 2 years if you only pay the minimum."},
                  {"type":"calculator","label":"Try the compound calculator below to see your money grow."},
                  {"type":"quiz","question":"You save ₱1,000 at 6% compound interest for 2 years. What is closer to your final amount?","options":["₱1,060","₱1,120","₱1,124","₱1,200"],"correctIndex":2,"explanation":"₱1,000 × 1.06 × 1.06 = ₱1,123.60. Compounding adds interest on interest each period."}
                ]
                """),

            lesson(3, "Preparing for Tuition Day", "PLANNING", "BEGINNER", "🎓", 6, false,
                "Save before enrollment — not during panic.",
                """
                [
                  {"type":"intro","text":"Enrollment sneaks up on you. Students who plan ahead never have to borrow or stress."},
                  {"type":"tips","title":"How to Save for Tuition","items":[
                    "Find out your tuition amount at least 2 months before enrollment.",
                    "Divide tuition by the number of weeks until enrollment day.",
                    "Set that amount aside every week — treat it like a bill, not optional.",
                    "Open a separate piggy bank or e-wallet folder just for tuition.",
                    "Tell your parents your target so they can plan with you."
                  ]},
                  {"type":"example","title":"Tuition: ₱20,000 due in 10 weeks","text":"Weekly savings target: ₱2,000 • Avoid dipping into this fund for any reason"},
                  {"type":"callout","tone":"info","text":"Create a Savings Goal in Ipon Challenge right now. Name it your semester + Tuition and set the target date to enrollment week."},
                  {"type":"quiz","question":"Tuition is ₱15,000 due in 8 weeks. How much must you save per week?","options":["₱1,500","₱1,875","₱2,000","₱1,250"],"correctIndex":1,"explanation":"₱15,000 ÷ 8 weeks = ₱1,875 per week."}
                ]
                """),

            lesson(4, "Your First Credit Card: What No One Tells You", "CREDIT", "INTERMEDIATE", "💳", 7, false,
                "Credit cards are tools — dangerous ones if misused.",
                """
                [
                  {"type":"intro","text":"Banks make credit cards look like free money. They are not. Here is what you must know before swiping."},
                  {"type":"tips","title":"Credit Card Rules for Students","items":[
                    "Always pay the FULL balance every month — never just the minimum.",
                    "The minimum payment trap: paying ₱500/month on a ₱10,000 balance can take 3+ years to clear.",
                    "Your credit limit is not your budget. Treat it as an emergency tool only.",
                    "Interest in the Philippines: typically 2–3.5% per month (24–42% per year).",
                    "One late payment can damage your credit score for months."
                  ]},
                  {"type":"example","title":"The Minimum Payment Trap","text":"Balance: ₱10,000 • Interest: 3%/month • Minimum payment: ₱300/month • Time to pay off: 5+ years • Total interest paid: ₱8,000+"},
                  {"type":"callout","tone":"warning","text":"If you cannot afford to pay the full amount at month-end, you cannot afford to buy it on credit."},
                  {"type":"quiz","question":"You have a ₱5,000 credit card balance. What is the smartest move?","options":["Pay the minimum ₱250","Ignore it this month","Pay the full ₱5,000","Pay ₱1,000 and carry the rest"],"correctIndex":2,"explanation":"Paying in full avoids interest entirely. Any balance carried forward compounds at 2–3.5%/month."}
                ]
                """),

            lesson(5, "The 50-30-20 Rule for Students", "BUDGETING", "BEGINNER", "📊", 5, false,
                "A simple framework to allocate your allowance.",
                """
                [
                  {"type":"intro","text":"The 50-30-20 rule is the simplest budgeting framework in the world. Adapted for students, it looks like this:"},
                  {"type":"tips","title":"The Student 50-30-20 Split","items":[
                    "50% Needs — food, transport, load/data, school supplies.",
                    "30% Wants — leisure, hang-outs, Netflix, milk tea.",
                    "20% Savings — emergency fund, goals, tuition fund."
                  ]},
                  {"type":"example","title":"Weekly baon: ₱1,000","text":"Needs: ₱500 • Wants: ₱300 • Savings: ₱200"},
                  {"type":"callout","tone":"positive","text":"Can't save 20%? Start with 5%. Build the habit first, then increase gradually."},
                  {"type":"quiz","question":"Your monthly allowance is ₱5,000. How much should go to savings under the 50-30-20 rule?","options":["₱500","₱1,000","₱1,500","₱2,500"],"correctIndex":1,"explanation":"20% of ₱5,000 = ₱1,000. That is your savings target each month."}
                ]
                """),

            lesson(6, "Emergency Fund: Why Every Student Needs ₱500 Hidden Away", "SAVINGS", "BEGINNER", "🛡️", 4, false,
                "Your financial safety net, no matter how small.",
                """
                [
                  {"type":"intro","text":"An emergency fund is money set aside for unexpected expenses — not for wants, not for fun. Just for real emergencies."},
                  {"type":"tips","title":"Emergency Fund for Students","items":[
                    "Start with ₱500. That covers most small emergencies (broken phone screen, unexpected fare, medicine).",
                    "Build toward 1 week of living expenses.",
                    "Keep it in a separate e-wallet or envelope — out of sight, out of mind.",
                    "Only use it for true emergencies. Craving milk tea is not an emergency.",
                    "Replenish it immediately after use."
                  ]},
                  {"type":"example","title":"What counts as an emergency?","text":"✅ Medical expense • ✅ Urgent transportation • ✅ Lost phone • ❌ Barkada outing • ❌ New sneakers"},
                  {"type":"callout","tone":"positive","text":"Students with an emergency fund report significantly less financial stress during the semester."},
                  {"type":"quiz","question":"Your emergency fund hits zero after a medical expense. What should you do first?","options":["Leave it empty","Borrow from friends","Replenish it from the next allowance","Use your tuition savings"],"correctIndex":2,"explanation":"Always replenish the emergency fund as soon as possible so you are ready for the next unexpected event."}
                ]
                """),

            lesson(7, "Tracking Small Expenses: Why ₱20 Matters", "BUDGETING", "BEGINNER", "🔍", 4, false,
                "Small leaks sink big ships — and big budgets.",
                """
                [
                  {"type":"intro","text":"₱20 here, ₱35 there. It feels like nothing. But track it for a week and you might be shocked."},
                  {"type":"tips","title":"How Small Expenses Add Up","items":[
                    "₱20 extra load daily = ₱600/month.",
                    "₱50 snack between classes = ₱1,500/month.",
                    "₱30 parking/tricycle extra = ₱900/month.",
                    "These three alone = ₱3,000/month — often 30–60% of a student's baon."
                  ]},
                  {"type":"example","title":"The ₱20 Challenge","text":"Log every single expense for 7 days, including the smallest ones. Most students discover 15–20% of their spending is invisible small purchases they forgot about."},
                  {"type":"callout","tone":"info","text":"Open Ipon Challenge and log every expense this week, no matter how small. After 7 days, check your analytics to see your real spending pattern."},
                  {"type":"quiz","question":"You spend ₱25 on extras daily. How much does that add up to in a 30-day month?","options":["₱500","₱600","₱750","₱1,000"],"correctIndex":2,"explanation":"₱25 × 30 days = ₱750. Small daily amounts become large monthly amounts."}
                ]
                """),

            lesson(8, "How to Handle Group Expenses Without Losing Friends", "BUDGETING", "BEGINNER", "👥", 5, false,
                "Split bills fairly and keep the friendship intact.",
                """
                [
                  {"type":"intro","text":"Group outings and projects are fun — until nobody knows who owes what. Here is how to handle it cleanly."},
                  {"type":"tips","title":"Clean Group Expense Rules","items":[
                    "Agree on the budget BEFORE going out, not after.",
                    "One person pays and everyone settles immediately — not 'I'll pay you later'.",
                    "Use the Split Bills feature in Ipon Challenge to calculate fair shares instantly.",
                    "For school projects: collect money upfront, keep receipts, show the group the total.",
                    "Never lend more than you are comfortable not getting back."
                  ]},
                  {"type":"example","title":"Group dinner: ₱1,800 for 6 people","text":"Per person: ₱300 • Collect before ordering, not after eating."},
                  {"type":"callout","tone":"warning","text":"'Utang ng kaibigan' is one of the top sources of stress and conflict among students. Clear agreements prevent resentment."},
                  {"type":"quiz","question":"Your group spends ₱2,400 on a project. There are 4 members. What is each person's share?","options":["₱500","₱600","₱650","₱700"],"correctIndex":1,"explanation":"₱2,400 ÷ 4 = ₱600 each. Use the Ipon Challenge Split Bills tool to compute this instantly."}
                ]
                """),

            lesson(9, "Understanding Debt: When Borrowing is Okay", "DEBT", "INTERMEDIATE", "⚖️", 6, false,
                "Not all debt is bad — but most student debt is.",
                """
                [
                  {"type":"intro","text":"Debt is a tool. Like a knife, it can help you cook or hurt you badly. The key is knowing the difference between good debt and bad debt."},
                  {"type":"tips","title":"Good Debt vs. Bad Debt for Students","items":[
                    "GOOD: Student loans for education with a clear return (degree, skills, career).",
                    "BAD: Borrowing for wants — gadgets, clothes, travel — with no income to repay.",
                    "UGLY: Informal lending (5-6) at 20% per month. Never. Under. Any. Circumstances.",
                    "Rule: only borrow what you have a concrete plan to repay.",
                    "Before borrowing, ask: will this produce income or just pleasure?"
                  ]},
                  {"type":"example","title":"5-6 Lending Trap","text":"Borrow ₱1,000 → repay ₱1,200 after 30 days (20%/month = 240%/year). ₱5,000 borrowed becomes ₱12,000 in 6 months."},
                  {"type":"callout","tone":"warning","text":"If you are struggling with debt, tell a trusted adult. There is no shame in asking for help early before small debt becomes a crisis."},
                  {"type":"quiz","question":"Which type of borrowing is most financially dangerous for a student?","options":["Government student loan for tuition","Borrowing from parents","5-6 informal lending at 20%/month","Credit card paid in full monthly"],"correctIndex":2,"explanation":"5-6 lending charges 20%/month = 240%/year. It is predatory and can trap borrowers in a cycle that is very difficult to escape."}
                ]
                """),

            lesson(10, "Financial Goals: Short vs. Long Term", "PLANNING", "INTERMEDIATE", "🎯", 6, false,
                "Build a roadmap for your money, not just a budget.",
                """
                [
                  {"type":"intro","text":"A budget tells you where your money goes. A goal tells you where your money is going. Both are essential — but goals are what make budgeting meaningful."},
                  {"type":"tips","title":"Types of Student Financial Goals","items":[
                    "SHORT TERM (1–3 months): New school bag, trip with barkada, emergency fund starter.",
                    "MEDIUM TERM (3–12 months): Laptop, tuition fund, semester budget.",
                    "LONG TERM (1+ years): First investment, business capital, graduation fund.",
                    "Make goals SMART: Specific, Measurable, Achievable, Realistic, Time-bound.",
                    "Write it down. Students with written goals save 2× more than those without."
                  ]},
                  {"type":"example","title":"SMART Goal Example","text":"'Save ₱8,000 for a laptop by December 2026 by setting aside ₱800/month starting June.'"},
                  {"type":"callout","tone":"positive","text":"Create a Savings Goal in Ipon Challenge right now. Give it a name, a target amount, and a deadline. Watch your progress ring fill up."},
                  {"type":"quiz","question":"Which of these is a SMART financial goal?","options":["Save more money","Stop wasting","Save ₱5,000 for tuition by October 31 by saving ₱1,000/month","Try to spend less"],"correctIndex":2,"explanation":"A SMART goal is specific (₱5,000 for tuition), measurable, achievable, realistic, and time-bound (by October 31)."}
                ]
                """)
        );
    }

    private FinancialLesson lesson(
            int order, String title, String category, String difficulty,
            String icon, int minutes, boolean hasCalc, String description, String content) {
        return FinancialLesson.builder()
                .orderIndex(order)
                .title(title)
                .category(category)
                .difficulty(difficulty)
                .icon(icon)
                .estimatedMinutes(minutes)
                .hasCalculator(hasCalc)
                .description(description)
                .content(content.strip())
                .build();
    }
}
