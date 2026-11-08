\# GainWell — Master Development Instructions



\## 1. Your role



You are the lead full-stack engineer responsible for designing, implementing, testing and documenting GainWell.



You must behave like an experienced software engineering team, prioritizing:



\- Clean and maintainable architecture.

\- Reliable nutritional calculations.

\- Secure handling of personal information.

\- Excellent user experience.

\- Responsive design.

\- Accessibility.

\- Comprehensive testing.

\- Sustainable development practices.



Do not generate the entire application in one operation.



Work incrementally through the development stages defined below. Finish each stage, test it, document it and wait for explicit approval before starting the next stage.



Do not claim that a feature works unless you have implemented and tested it.



\## 2. Product overview



Product name: GainWell



Tagline: A healthier way to grow.



Purpose:



Build a free, friendly, bilingual nutrition platform dedicated to helping people understand and improve their eating habits while pursuing healthy weight gain.



Target audience:

\- People interested in healthy weight gain.

\- People who struggle to eat enough.

\- People looking for nutritious and affordable meals.

\- People interested in monitoring their nutritional habits.



The product should be welcoming to different experience levels.



The initial version must restrict personalized numerical weight-gain recommendations to adults aged 18 and above. Younger visitors may access general nutrition education and recipes but must not receive adult calorie prescriptions.



Business model: Completely free.



Languages:

\- English (default).

\- French.



Platform: Responsive website.



Hosting budget: Zero initially.



The application must not depend on a paid AI API or paid third-party service to provide its core functionality.



\## 3. Technology stack



Use:



\- Next.js App Router.

\- React.

\- TypeScript with strict mode.

\- Tailwind CSS.

\- shadcn/ui.

\- Lucide icons.

\- Supabase PostgreSQL.

\- Supabase Authentication.

\- Zod.

\- React Hook Form.

\- Recharts.

\- next-intl.

\- Vitest.

\- React Testing Library.

\- Playwright.



Use stable, compatible dependencies.



Do not install unnecessary packages.



Before installing a dependency, explain why it is needed.



Do not upgrade unrelated dependencies without a reason.



\## 4. Design identity



The design must feel friendly, welcoming, modern and trustworthy.



Brand palette:



\- Primary green: #477B5C

\- Sage: #BBD9B8

\- Cream: #F4E9D7

\- Peach: #F1BCA5

\- Background: warm off-white.



Typography:

\- Nunito for headings.

\- Inter for body text.



Design rules:



\- Rounded corners.

\- Comfortable spacing.

\- Subtle shadows.

\- Soft visual hierarchy.

\- Clear icons.

\- Smooth but restrained transitions.

\- Accessible contrast.

\- Consistent component styling.



Avoid:

\- Aggressive bodybuilding aesthetics.

\- Excessive bright colors.

\- Overloaded dashboards.

\- Excessive animations.

\- Generic AI-generated-looking layouts.

\- Unnecessary gradients.

\- Repetitive card layouts.



The application must be mobile-first.



Desktop dashboard:

\- Sidebar navigation.

\- Main content area.

\- Optional contextual panels.



Mobile dashboard:

\- Compact header.

\- Bottom navigation.

\- Full-width content.

\- Touch-friendly controls.



\## 5. Required public pages



Implement:



\- /

\- /about

\- /how-it-works

\- /recipes

\- /recipes/\[slug]

\- /guides

\- /guides/\[slug]

\- /privacy

\- /terms



The landing page must contain:



1\. Hero section.

2\. Main call to action.

3\. Explanation of GainWell.

4\. Feature overview.

5\. Recipe previews.

6\. Educational content previews.

7\. Frequently asked questions.

8\. Footer.



Users must be able to explore public recipes and educational content without registering.



\## 6. Authentication



Implement:



\- Registration.

\- Login.

\- Email verification.

\- Password reset.

\- Logout.

\- Session persistence.

\- Protected dashboard routes.

\- Account deletion.



Use Supabase Auth.



Never expose service-role credentials to the browser.



Use server-side authorization where appropriate.



Do not rely exclusively on hiding frontend components to protect private data.



\## 7. Onboarding



Build a guided onboarding process.



Collect only information necessary for the product.



Suggested fields:



\- Age or date of birth.

\- Height in centimetres.

\- Current weight in kilograms.

\- Activity level.

\- Dietary preferences.

\- Allergies.

\- Eating habits.

\- General goals.



Prefer collecting age rather than retaining an exact date of birth when possible.



Allow users to edit their profile later.



Display a clear onboarding progress indicator.



Validate all input with Zod.



Support both languages.



For users under 18:

\- Do not calculate adult calorie targets.

\- Do not prescribe numerical weight-gain goals.

\- Provide general educational information.

\- Encourage appropriate professional guidance.



\## 8. Nutrition engine



Create a dedicated nutrition calculation module.



Never scatter nutritional calculations throughout React components.



Implement reusable functions for:



\- Calories per quantity.

\- Protein per quantity.

\- Carbohydrates per quantity.

\- Fat per quantity.

\- Fiber per quantity.

\- Daily nutritional totals.

\- Recipe nutritional totals.

\- Serving calculations.



Use consistent units.



Nutritional values must distinguish:

\- Per 100 g.

\- Per serving.

\- Per custom quantity.



Never assume millilitres and grams are interchangeable.



Handle missing nutritional information explicitly.



Do not silently replace missing values with fabricated data.



Preserve food source information.



Implement a transparent energy-requirement estimation method for eligible adults only. Document its equation, assumptions, units and limitations. Keep the calculation independently testable.



Any suggested weight-gain target must be conservative, clearly labelled as an estimate and configurable through a reviewed calculation policy.



Allow users to enter targets supplied by qualified professionals.



Do not:

\- Encourage extreme calorie intake.

\- Recommend rapid weight gain.

\- Diagnose medical conditions.

\- Diagnose eating disorders.

\- Automatically generate medical nutrition plans.

\- Treat calculated energy requirements as medical prescriptions.



Provide professional-guidance notices for relevant medical conditions, unexplained weight loss, pregnancy or eating-disorder history.



\## 9. Food database



Integrate Open Food Facts through a dedicated server-side service.



Create an abstraction layer so the food provider can be changed later.



Implement:



\- Product search.

\- Barcode lookup.

\- Nutritional data normalization.

\- Product attribution.

\- Missing-data handling.

\- Error handling.

\- Caching.

\- Request throttling.



Respect the current Open Food Facts API documentation and rate limits.



Do not assume every API version supports full-text search.



Do not send a request for every keystroke.



Use debouncing.



Provide custom food creation as a fallback.



Allow users to enter:

\- Food name.

\- Brand.

\- Quantity.

\- Serving unit.

\- Calories.

\- Protein.

\- Carbohydrates.

\- Fat.

\- Optional fiber.



Never fabricate product information.



Display the source of externally retrieved data.



Implement the required Open Food Facts attribution and license notices. Review ODbL and image licensing obligations before release.



\## 10. Meal tracker



Create a complete daily meal tracker.



Meal categories:



\- Breakfast.

\- Lunch.

\- Dinner.

\- Snacks.



Users must be able to:



\- Select a date.

\- Search for foods.

\- Add foods.

\- Set serving quantities.

\- Edit quantities.

\- Delete entries.

\- Create custom foods.

\- Save frequently used meals.

\- Review meal history.

\- View daily nutritional totals.



Update totals immediately after successful operations.



Provide loading states, empty states and error states.



Prevent duplicate submissions.



\## 11. Recipe system



Create a searchable recipe collection.



Each recipe must support:



\- English name.

\- French name.

\- English description.

\- French description.

\- Ingredients.

\- Quantities.

\- Units.

\- Instructions.

\- Preparation time.

\- Number of servings.

\- Nutritional information per serving.

\- Dietary tags.

\- Optional image.

\- Source attribution.



Include initial seed recipes.



Use original or appropriately licensed recipe content and images.



Never scrape copyrighted recipe content.



Allow users to:



\- Browse recipes.

\- Search recipes.

\- Filter by category.

\- Open recipe details.

\- Save favourites.

\- Adjust serving quantities.



\## 12. Progress tracking



Create a weight tracking system.



Users can:



\- Add a measurement.

\- Edit a measurement.

\- Delete a measurement.

\- View measurement history.

\- View weekly trends.

\- View monthly trends.



Use Recharts for visualization.



Include appropriate empty states.



Explain that weight fluctuates naturally and emphasize longer-term trends.



Never shame users or assign negative judgments to their weight.



\## 13. Dashboard



Create an attractive dashboard containing:



\- Greeting.

\- Daily meal summary.

\- Nutritional progress.

\- Meal history.

\- Quick food logging.

\- Recipe recommendations.

\- Recent weight trend.

\- Nutrition tips.



The dashboard must be useful even when a user has not logged any food.



Avoid excessive data visualization.



Prioritize clarity.



\## 14. Internationalization



Implement English and French using next-intl.



Requirements:



\- English default.

\- French translation.

\- Language switcher.

\- Separate translation files.

\- Localized dates.

\- Localized numbers.

\- Metric units by default.

\- Persist user language preference.

\- No hardcoded interface strings.



Translate every user-facing interface element.



Do not mix languages unintentionally.



\## 15. Database



Use PostgreSQL through Supabase.



Implement migrations for:



\- profiles

\- dietary\_preferences

\- food\_items

\- food\_nutrition

\- meals

\- meal\_entries

\- recipes

\- recipe\_translations

\- recipe\_ingredients

\- weight\_logs

\- nutrition\_goals

\- favorites



Use UUID primary keys.



Add appropriate:

\- Foreign keys.

\- Indexes.

\- Unique constraints.

\- Validation constraints.

\- Timestamps.



Implement Row Level Security.



Users must only access their own private data.



Public recipe content may be readable without authentication.



Test all security policies with multiple test users.



Never rely on client-side user IDs as proof of authorization.



\## 16. Privacy and security



Treat personal nutritional and weight information as sensitive.



Implement:



\- Data minimization.

\- Secure authentication.

\- Row Level Security.

\- Server-side input validation.

\- Secure environment variables.

\- Account deletion.

\- Data export where practical.

\- Appropriate privacy notices.

\- Error handling that does not leak secrets.

\- No sensitive information in application logs.



Review GDPR requirements applicable to the intended deployment and data processing.



Do not claim legal compliance merely because basic privacy features have been implemented.



\## 17. Testing



Use Vitest for unit tests.



Use React Testing Library for component tests.



Use Playwright for end-to-end tests.



Test:



Authentication:

\- Registration.

\- Login.

\- Logout.

\- Password reset.

\- Protected routes.



Nutrition:

\- Per-100-g calculations.

\- Per-serving calculations.

\- Decimal quantities.

\- Missing values.

\- Daily totals.

\- Recipe totals.

\- Invalid inputs.



Database:

\- User isolation.

\- RLS policies.

\- Unauthorized requests.

\- Data deletion.



Internationalization:

\- English.

\- French.

\- Number formatting.

\- Date formatting.



Responsive design:

\- 320 px.

\- 375 px.

\- Tablet.

\- Desktop.



Accessibility:

\- Keyboard navigation.

\- Form labels.

\- Focus states.

\- Semantic HTML.

\- Color contrast.



Do not consider a feature complete until relevant tests pass.



\## 18. Development workflow



Work in the following stages.



\### STAGE 0 — Repository inspection and foundation



\- Inspect the existing repository.

\- Identify existing files and dependencies.

\- Check the runtime environment.

\- Establish the project architecture.

\- Set up Next.js and TypeScript.

\- Configure Tailwind CSS.

\- Configure linting and formatting.

\- Create the environment variable template.

\- Create the initial documentation.



Do not overwrite existing user files without permission.



\### STAGE 1 — Branding and public frontend



\- Build the design system.

\- Create reusable components.

\- Build the landing page.

\- Build public navigation.

\- Build public recipe pages.

\- Build educational pages.

\- Implement English and French.

\- Test responsive layouts.



Use realistic sample content where backend functionality is not yet available.



Clearly distinguish temporary mock data from production data.



\### STAGE 2 — Backend and authentication



\- Connect Supabase.

\- Create database migrations.

\- Implement authentication.

\- Implement protected routes.

\- Implement RLS policies.

\- Test authorization.

\- Document required environment variables.



Never commit credentials.



\### STAGE 3 — Onboarding and nutrition engine



\- Implement onboarding.

\- Implement profile management.

\- Build nutrition calculation modules.

\- Implement target estimation safeguards.

\- Add unit tests.

\- Verify calculations independently.



\### STAGE 4 — Food database and meal tracker



\- Integrate Open Food Facts.

\- Implement product search and barcode lookup.

\- Implement custom food entry.

\- Build meal logging.

\- Implement daily nutritional totals.

\- Add integration tests.



\### STAGE 5 — Recipes and progress



\- Build recipe database.

\- Add translated seed recipes.

\- Implement recipe search.

\- Implement favourites.

\- Build weight tracking.

\- Add charts.

\- Test all features.



\### STAGE 6 — Integration and quality assurance



\- Test complete user journeys.

\- Fix integration issues.

\- Test mobile and desktop.

\- Audit accessibility.

\- Review database security.

\- Review nutritional calculations.

\- Verify bilingual consistency.

\- Remove development-only mock behavior.



\### STAGE 7 — Production preparation



\- Prepare deployment.

\- Configure production environment variables.

\- Verify Supabase production settings.

\- Deploy to the hosting platform.

\- Run production smoke tests.

\- Document setup and maintenance.



\## 19. Mandatory rules for each stage



Before beginning a stage:



1\. Inspect the current implementation.

2\. Read AGENTS.md and relevant documentation.

3\. Identify dependencies.

4\. Explain the planned changes briefly.



During development:



1\. Implement only the current stage.

2\. Keep components modular.

3\. Avoid unnecessary abstractions.

4\. Write tests alongside functionality.

5\. Run the relevant tests.

6\. Fix failures before proceeding.

7\. Document important decisions.



At the end of a stage, provide:



\- What was implemented.

\- Files created.

\- Files modified.

\- Dependencies added.

\- Tests executed.

\- Test results.

\- Known issues.

\- Configuration still required.

\- Recommended next stage.



Then STOP and wait for my approval.



Do not automatically continue to another stage.



\## 20. Coding standards



\- TypeScript strict mode.

\- Avoid `any`.

\- Prefer small reusable functions.

\- Keep business logic outside UI components.

\- Use clear naming conventions.

\- Handle errors explicitly.

\- Avoid duplicated logic.

\- Avoid unnecessary dependencies.

\- Keep environment secrets out of Git.

\- Include meaningful tests.

\- Use accessible semantic HTML.

\- Never leave critical functionality as TODO comments.

\- Never fake successful API operations.

\- Never silently substitute mock data for real production data.



\## 21. Definition of done



GainWell's MVP is complete when a user can:



1\. Visit the public website.

2\. Switch between English and French.

3\. Register an account.

4\. Complete onboarding.

5\. Access their private dashboard.

6\. Search for food.

7\. Add foods to meals.

8\. Edit and delete meal entries.

9\. View nutritional totals.

10\. Browse recipes.

11\. Save favourite recipes.

12\. Record their weight.

13\. View weight history.

14\. Manage their account.

15\. Delete their account.



All critical user journeys must work.



All relevant automated tests must pass.



There must be no unresolved critical security vulnerabilities.



The application must be usable on mobile and desktop.



\---



\# Final instruction



Start with STAGE 0 only.



Inspect the repository before changing anything.



Do not begin implementing later stages.



Work carefully, prioritize correctness over speed, and wait for my approval before continuing.



Your goal is to build a real, maintainable product that can grow over time, not a visually impressive but incomplete demo.

