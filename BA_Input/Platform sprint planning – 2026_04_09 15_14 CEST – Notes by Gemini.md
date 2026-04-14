# 📝 Notes

Apr 9, 2026

## Platform sprint planning

Invited [Apeiron - Powerhouse](mailto:apeiron@powerhouse.inc) [liberuum - Powerhouse](mailto:liberuum@powerhouse.inc) [teep - Powerhouse](mailto:teep@powerhouse.inc) [Wouter - Powerhouse](mailto:wouter@powerhouse.inc) [Yasiel - Powerhouse](mailto:yasiel@powerhouse.inc)

Attachments [Platform sprint planning](https://www.google.com/calendar/event?eid=NWtsa21pa2ZoZmdoMnVnZjB2aXE4N2ZyczUgd291dGVyQHBvd2VyaG91c2UuaW5j) 

Meeting records [Transcript](?tab=t.3kir1elwbe0l) [Recording](https://drive.google.com/file/d/1dZLml4cLVuBT9Ay9XQbEvbxR8OmRmGDs/view?usp=drive_web) 

### Summary

MVP launch timeline debated with focus on core package dependencies and missing back-end functionality, addressing billing logic for subscription and required updates to document model and reducers.

**Powerhouse Migration and UI**  
Page migration progress was reported, confirming navigation reuse and a limitation on the theme switcher due to video background. Micro-animations and a new grid component were well-received, with an immediate decision to adjust the title font size from 36 pixels to 40 pixels for design system consistency.

**Subscription Logic and Document Model**  
Review of the subscription page revealed a blocker regarding dynamic cost projection and inconsistencies in billing cycle dates. A critical operation for advancing and settling the billing cycle is missing, necessitating a new reducer and business analysis to define proration and cost accrual logic.

**MVP Launch and Post-MVP Focus**  
The MVP launch timeline is contingent upon the release of core packages, with the highest priority being function completeness and running environments on Yakra. Post-MVP focus will shift to billing cycle settlement logic, tracking debt and credit, and subsequent Stripe Connect integration for credit card charging.

### Details

* **Progress on Powerhouse Pages Migration**: Yasiel \- Powerhouse reported on the progress of migrating pages, noting that the BA star and another section were initially broken, but they are now reusing the existing navigation bar. An intentional limitation for the migrated page is the absence of a theme switcher, as the video background is light-colored and displaying it in dark mode would look bad.

* **Video and Animation Improvements**: Yasiel \- Powerhouse discussed improvements to the video in the hero section, including an exploration into adding micro-animations. They confirmed that optimization points, such as making the video smaller, will be addressed after everything else is in place. Wouter \- Powerhouse thought the micro-animations looked great ([00:01:21](#00:01:21)).

* **Component Reuse and Lighthouse Metrics**: Yasiel \- Powerhouse confirmed that a new grid component is now available for reuse in other parts of the site. They noted that the Lighthouse metrics are similar to before, indicating no major regression in performance. The use cases page, which was previously in framer, is also being migrated ([00:02:32](#00:02:32)).

* **Scroll and Fading Effects**: Yasiel \- Powerhouse described the scroll effects implemented on the migrated page, including a small fade-in and a slide-up with a fading effect for the subtitles of each section. They mentioned that the links are working, and a previously hidden section is now visible across all resolutions ([00:03:43](#00:03:43)).

* **Font Size Consistency and Design System Adoption**: Wouter \- Powerhouse raised a concern about the styling of titles, noting a slight difference in font size (36 pixels versus 40 pixels). Yasiel \- Powerhouse agreed to adjust this and confirmed an effort to keep elements consistent across the site and align with the established design system, even if it means using different colors or container widths than those in framer ([00:04:55](#00:04:55)).

* **Button Styling Adjustments**: Wouter \- Powerhouse requested changes to a button's width and height, asking for more top and bottom padding, and an overall scale-up. Specific guidance was given to increase the width by approximately 20% and to make another button in the billing cycle section significantly wider, specifically by doubling the horizontal padding across all similar steps ([00:08:28](#00:08:28)) ([00:10:57](#00:10:57)).

* **Client Library Integration and Architecture Changes**: Yasiel \- Powerhouse confirmed that the new client library that Kalus has been developing is not yet being used ([00:10:57](#00:10:57)). They explained that integrating the login will require architectural changes, especially to handle mutations that need client-side signing, as this is currently done server-side ([00:12:01](#00:12:01)). Wouter \- Powerhouse emphasized that the login should be kept under a feature toggle and that the back-end integration needs to be cleaned up to handle signing operations ([00:13:07](#00:13:07)).

* **Subscription Page Review and Data Inconsistencies**: Wouter \- Powerhouse requested a look at the working subscription page to examine the billing cycle closing process ([00:13:07](#00:13:07)). Apeiron \- Powerhouse shared the subscription instance view, but noted that the dynamic cost projection was not updating correctly, calling it a blocker that they will need to address for UAT ([00:14:46](#00:14:46)).

* **Billing Cycle Logic Discrepancies**: Wouter \- Powerhouse pointed out inconsistencies in the displayed dates, noting that an annual billing cycle was showing a next payment date one month after the creation date ([00:16:03](#00:16:03)). The team attempted to find the relevant business logic within the service offering repository to understand how the next billing cycle date is determined ([00:17:47](#00:17:47)).

* **Missing Operation for Billing Cycle Advancement**: Following a review of the subscription instance schema and operations, Wouter \- Powerhouse and Apeiron \- Powerhouse determined that a key operation for advancing and settling the billing cycle, such as a 'Settle' or 'Advanced billing cycle' operation, is missing from the document model. The current operations are limited to setting the auto-renewal toggle and setting the renewal date ([00:36:20](#00:36:20)).

* **Defining Billing Cycle Closure Logic**: Wouter \- Powerhouse stressed the necessity of defining the precise logic for what happens when a billing cycle proceeds, which involves turning the logic into a reducer ([00:36:20](#00:36:20)). They noted that the document model must be capable of calculating the actual bill when the cycle settles, potentially through a query function that calculates the stacked-up costs until a specific date ([00:38:26](#00:38:26)).

* **Determining Cost Accrual and Activation Payments**: The team discussed when costs are owed, concluding that upon activation, the user owes the fixed costs and the setup cost, and they pay in advance for the "included" usage that is dependent on utilization ([00:42:57](#00:42:57)) ([00:51:32](#00:51:32)). Overage costs for variable usage are calculated and charged at the end of the billing cycle ([00:43:57](#00:43:57)).

* **Prorata Charging Mechanism and Business Logic Analysis**: Wouter \- Powerhouse described a complex prorata mechanism required for when a user adds or removes services within an ongoing billing cycle ([00:44:40](#00:44:40)). Apeiron \- Powerhouse acknowledged that the current subscription instance is limited in this regard, and they were assigned the task of conducting a business analysis to fully describe the proration and cost-related mechanisms ([00:47:38](#00:47:38)) ([00:55:28](#00:55:28)).

* **Metric Reset Cycles and Document Model Blockers**: The team confirmed that reset cycles can be set at the individual metric level, independent of the billing cycle. Apeiron \- Powerhouse noted that they currently face a blocker in going through the full flow in staging because of issues with the contributor billing setup, for which Liberuum \- Powerhouse offered assistance ([00:55:28](#00:55:28)).

* **Document Model and Reducers for Calculations**: The dashboard reads from document models that are synchronized with any changes made by the RGH manager or the user. Due to the complicated nature of calculations, this complexity must be included in the document model, necessitating updates to the reducers, which correctly change the state of the environment ([00:59:13](#00:59:13)). Any calculation performed, whether visually or otherwise, must go through the reducers to maintain business logic and a single source of truth ([00:59:59](#00:59:59)).

* **Handling Derived Values and State Changes**: A missing feature in the document models is the handling of derived values, which was previously seen in the invoice example ([00:59:59](#00:59:59)). For values that change constantly, such as a current timestamp, it is necessary to use a pure query function utility instead of updating the document model every second. Any change in the document's state that requires recalculation of related items must be processed through the reducers to ensure consistency ([01:01:07](#01:01:07)).

* **Subscription Instance Document Model Update**: Currently, the system is landing on the operator drive instead of generating a team drive. Apeiron suggested enriching the subscription instance document model by writing utility functions and additional reducers, which is considered a complex task requiring analysis and explanation before coding the business logic ([01:02:15](#01:02:15)).

* **Tracking Debt and Credit for Billing**: Wouter outlined the necessary steps for the billing cycle, including keeping track of the debt, which is currently a missing state in the state schema. They advised tracking two additional state properties: total debt and total credit, where the amount owed is the difference between total debt minus total credit ([01:03:17](#01:03:17)). These numbers should be updated at the end of the billing cycle and upon receiving a payment to reach a zero balance ([01:04:27](#01:04:27)).

* **MVP Launch Timeline and Dependencies**: The first priority is the MVP launch, and Wouter stated that the launch timeline depends on the release of the core packages ([01:04:27](#01:04:27)). Liberuum questioned the timeline, noting that they are still running on the V6 development versioning and inquired about releasing V6 production concurrently with the MVP ([01:05:39](#01:05:39)). The highest priority is achieving function completeness for the MVP scope, and they intend to run environments on Yakra for the MVP rather than the current Vcoded digital ocean environment ([01:06:52](#01:06:52)).

* **Missing Components for MVP Functionality**: For the public site, Wouter confirmed that they are nearly ready after UAT and feedback, though some open feedback items remain. The last missing step is the calculations and presentation of debt and credit, as previously discussed, and additional feedback is expected regarding the footer and necessary legal documents ([01:08:03](#01:08:03)). The framer homepage also needs to be finalized, and the login integration is now considered out of scope for the MVP ([01:09:16](#01:09:16)).

* **Task Allocation and Focus for Yasiel**: Yasiel indicated they are running low on tasks and expected to finish the homepage soon ([01:09:16](#01:09:16)). Wouter recommended that Yasiel focus on the back-end components, including the connect packages and editors, as that is where the largest batch of missing feedback will likely be found ([01:10:31](#01:10:31)). Yasiel will contact Liberuum to begin onboarding on the packages and assist with back-end work after completing the homepage and any immediate UI items ([01:11:34](#01:11:34)).

* **Post-MVP Focus: Billing Cycle Settlement and Stripe Integration**: Following the MVP, the next major milestone is implementing the billing cycle settlement for subscriptions to determine the charge amount. Subsequently, the team will integrate with Stripe Connect to implement credit card charging. Stripe Connect is a payment solution specifically for marketplaces, which is distinct from a SAS platform where payments are collected only for platform services ([01:12:37](#01:12:37)) ([01:15:43](#01:15:43)).

* **Marketplace vs. SAS Platform Payment Structures**: A SAS platform collects payments for its own services, similar to a web shop, but a marketplace automatically pays out a portion of customer payments to third-party sellers or service providers ([01:14:09](#01:14:09)). The current plan is for Acra to initially charge users directly, operating as a SAS platform, and later transition to a marketplace model where third-party providers can receive payments through the platform ([01:15:43](#01:15:43)).

* **Future Payment Plans and Stripe Research**: Wouter suggested that the team, specifically anyone looking ahead, should start reading up on the Stripe documentation, as they will likely first implement SAS platform payments and then transition to marketplace payments ([01:16:50](#01:16:50)). The goal is to answer the question of what to charge when the billing cycle ends, and Stripe will be the integration used for this ([01:18:22](#01:18:22)).

* **Meeting Scheduling Logistics**: Apeiron raised a logistical question about confirming the team present on the call at least one day in advance. Wouter proposed making everyone optional for the second call and deciding who joins during the preceding platform call ([01:19:38](#01:19:38)). A possible change in schedule to Friday was discussed, which would allow for a day in between the platform call and this follow-up call, potentially improving preparation time ([01:20:25](#01:20:25)).

* **Justification for Stripe Integration**: Liberuum asked if the integration with Stripe was primarily for legal reasons, but Wouter clarified that the main reason is paying convenience and reducing friction for users. Stripe supports global payments, works with the UK legal entity, and handles credit card charges, which is essential for subscription payments with relatively small amounts ([01:21:18](#01:21:18)). For larger payments, the plan is to use a different, hybrid mechanism involving stable coins and smart contracts ([01:22:44](#01:22:44)).

* **Clarified Project Priorities**: The immediate priorities are the MVP scope, addressing open feedback items, and enabling UAT on the connect side. Following the MVP, the next priority is the post-MVP scope, which involves figuring out how the subscription instances handle the end of a billing cycle, including metric resets and the stacking of debt and credit. The final priority is the Stripe integration to enable credit card charging ([01:24:05](#01:24:05)). The subscription instance billing cycle is considered more urgent than the login integration for Acra ([01:25:37](#01:25:37)).

### Suggested next steps

- [ ] \[Yasiel\] Optimize Video: Chase optimization points; make the video file smaller.

- [ ] \[Yasiel\] Adjust Font: Adjust title font size from 40 pixels to 36 pixels.

- [ ] \[Yasiel\] Fix Regression: Fix the navigation bar background regression missing on the service page and other pages.

- [ ] \[Yasiel\] Update Labels: Change billing cycle labels to end consistently with \-ly (e.g., annually, quarterly).

- [ ] \[The group\] Plan Login: Plan the integration steps for the client library to enable login functionality.

- [ ] \[Apeiron\] Investigate Costs: Take a deep dive into dynamic cost calculations; make billing components ready for UAT.

- [ ] \[Apeiron\] Analyze Billing Logic: Perform analysis defining billing cycle proceeding mechanics, including cost calculations and metric resets. Use analysis to update Document Model reducers.

- [ ] \[liberuum\] Support Session: Help Apeiron set up contributor building; schedule a session together to address document model issues.

- [ ] \[Apeiron, liberuum\] Update Billing Logic: Perform analysis on billing cycle complexity; explain required changes. Enrich subscription instance document model; include total debt and total credit state properties; implement calculation utils and additional reducers with liberuum support.

- [ ] \[The group\] Migrate MVP Environment: Ensure MVP environments run on the vetra platform, completing the necessary V6 production upgrade package changes.

- [ ] \[Yasiel, Lar\] Assist Backend Development: Contact Lar to coordinate onboarding and assist with development of Connect packages and backend editor components.

- [ ] \[Wouter\] Reschedule Call: Schedule the next planning call for next week; consider moving the timing to Friday.

*You should review Gemini's notes to make sure they're accurate. [Get tips and learn how Gemini takes notes](https://support.google.com/meet/answer/14754931)*

*Please provide feedback about using Gemini to take notes in a [short survey.](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=_B-mPf1cDa50dF5bUnRtDxITOAIIigIgABgBCA&detailid=standard)*

# 📖 Transcript

Apr 9, 2026

## Platform sprint planning \- Transcript

### 00:00:00

   
**Yasiel \- Powerhouse:** basically hiding. Um there is some section like this one that you can see that is completely broken. Um also the BA star was broken the um was basically seeing only the middle which is broken. So um we we basically are migrating everything here and this is what we have right now. we are reusing the same bar that we that we have in the rest the page. So this is the the same one. Uh the only edge case that we are currenting here is that we are not going to have the the theme switcher. Uh this page is going to be display in light mode only all the time because um well basically this video uh has a light background. We don't have like D mode video to to to switch between the two videos and it looks um bad basically. Um but I also did some improvements that you this is not complete yet but you may see something that that are different because uh for instance the video here you go to the to the hero section you're going to see that is um like good here.  
   
 

### 00:01:21 {#00:01:21}

   
**Yasiel \- Powerhouse:** So now this uh works a little bit better in this way. Uh I added this as some kind of exploration to add some micro animations. Um as this I thought this was an image but it's actually one image. Um the each part of the independent images. So I tried to I animation. I don't know if you like it or not. I can keep it or remove it. Um that was um that should be easy.  
**Wouter \- Powerhouse:** I think that looks great. The um were you able to uh compress the video a bit or uh or didn't uh didn't look into  
**Yasiel \- Powerhouse:** uh no I what I'm doing right now is try to have sorry  
**Wouter \- Powerhouse:** that  
**Yasiel \- Powerhouse:** everything in place and after that I'm going to to try to chase uh some uh optimization points that we can to to make the video smaller and a few others that that we might find. I run the the lighthouse metrics and they looks uh pretty similar.  
   
 

### 00:02:32 {#00:02:32}

   
**Yasiel \- Powerhouse:** So there is no like a big regression or a regression at all basically. So I'm going to to keep that at the end. Also the this uh grid tumor uh is also we we now have this component. So if you want to use it in some other places now we also have it and we can copy it and and reuse it. I the by the way the the effect that we have here you can  
**Wouter \- Powerhouse:** Yeah.  
**Yasiel \- Powerhouse:** see I made a little bit faster is um how different because this is like a progression doing like that and I can do it but it's going to take a bit more time. Uh so but now I have it  
**Wouter \- Powerhouse:** But you you share the you share that library with me with those effects.  
**Yasiel \- Powerhouse:** here. Yeah. Yeah.  
**Wouter \- Powerhouse:** That's a great library.  
**Yasiel \- Powerhouse:** This is the one that this is the one that that I'm using here. We also have it here in the use cases that is the other page that was um um um mated because there was not only the the homepage also the use cases was in in framer.  
   
 

### 00:03:43 {#00:03:43}

   
**Yasiel \- Powerhouse:** So now we have this is almost completed. I was checking and everything's um looks to be in place. So now we have here if you see when I scroll down there is like a small fade in and this is like slide up with a fading effect the all the subtitle for each section. This section is um I need to make another iteration to see if there is something missing but or that need to be fixed but it affect the powerhouse stack section. um the footer everything else is uh migration and should be uh completed at this point. So the the links um are working this element. I thought it was some an image but it was actually um a real component. Um there was the there this section that I mentioned that was hiden in framer in a smaller resolution. Now it was basically all the the resolution. You can uh you will be able to see the same section. This one is is almost complete but I need to to make some um this is there the size of there but it's almost um everything  
   
 

### 00:04:55 {#00:04:55}

   
**Wouter \- Powerhouse:** Yeah.  
**Yasiel \- Powerhouse:** in place. Um  
**Wouter \- Powerhouse:** the um sorry to interrupt the uh the styling of the  
**Yasiel \- Powerhouse:** the  
**Wouter \- Powerhouse:** titles. Is that the same font weight of uh is that the same as framework? Can you put them side by  
**Yasiel \- Powerhouse:** uh yeah, let me see  
**Wouter \- Powerhouse:** side?  
**Yasiel \- Powerhouse:** before. Okay, this is uh this one is in 36 pixels. Um here is 40 pixels. I will need to adjust that. Um  
**Wouter \- Powerhouse:** Yeah, it's a tiny difference, but yet it uh so uh it just make it just a little bit more uh  
**Yasiel \- Powerhouse:** yeah, it's it's visible. Yeah.  
**Wouter \- Powerhouse:** prominent. Uh  
**Yasiel \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** yeah.  
**Yasiel \- Powerhouse:** I was checking the others and we need to check also the the the titles. I I also found that there is um a few things that are not consistent in all the sections.  
   
 

### 00:06:11

   
**Yasiel \- Powerhouse:** So um maybe we you will know that the maybe titleless text or something is not following the the exact same um consises or anything and what I'm trying to do is to keep it consistent across the the the site and also with the design system that we have that there's another difference that you are going to maybe note is um one is the the width of the container. This is whether because we are using the the the point the separate point that we are using for the rest of the of the platform. Um is different from the one that been using in framework. Um so for inance you go to this uh section you are going to to know some difference differences here because um the same in in the others um that is because this is weather. So the the cars are going to look a little bit different. Um, also the colors um for the text and subtitles and everything I I'm trying to use instead of the exact color that we that we have here in frameware we are use the colors that we have in the design system.  
   
 

### 00:07:25

   
**Yasiel \- Powerhouse:** So we don't have like differences or anything. The only thing uh the only colors that might be uh or might not be in the design system are this  
**Wouter \- Powerhouse:** Yeah.  
**Yasiel \- Powerhouse:** one that we have in the port house because this is from Vetra connect and renam and the background of the page because I had to to change it because basically we need a transition from the video to the to  
**Wouter \- Powerhouse:** Heat.  
**Yasiel \- Powerhouse:** the page background. So if we use the the background that we have there it's going to be too disruptive. Um there is some tricks that I can do it but this way it looks uh it looks good. So maybe we can keep it this way with this this same.  
**Wouter \- Powerhouse:** Yeah. Yeah.  
**Yasiel \- Powerhouse:** Um the other changes that that we had was well you are seeing this enabled here because it was disabled via um feature flag and it is enabled on development. It's only disable staying on and production.  
   
 

### 00:08:28 {#00:08:28}

   
**Yasiel \- Powerhouse:** Um the other word just changes here and there a small connection. I already added the the the arrow that you requested. Um this uh button I don't know if this is wide enough for for you want to to make  
**Wouter \- Powerhouse:** I would um so I would first of all I would make it higher  
**Yasiel \- Powerhouse:** even  
**Wouter \- Powerhouse:** so more padding top and bottom and then um but like scale it up so the the length like the width uh also so I would do the width, I don't know, like another another um 20% extra or something. And then the the height as well. I think if you Yeah, let's see. Yeah,  
**Yasiel \- Powerhouse:** Uh something like this.  
**Wouter \- Powerhouse:** much better. Wider now.  
**Yasiel \- Powerhouse:** Um  
**Wouter \- Powerhouse:** Yeah, there we go. That's better. Like I think it's going to be even a little bit wider still. Yeah, much  
**Yasiel \- Powerhouse:** Okay. Well,  
   
 

### 00:09:45

   
**Wouter \- Powerhouse:** better.  
**Yasiel \- Powerhouse:** uh yeah, uh you maybe cannot there was a regression with the the land immigration. I'm going to to fix that because the the the background that we have in the yeah in the in the nar is missing now in in the service page and the other pages but that will be fixed. Um the others are basically um well the ones that Apo mentioned in the in the previous call. Uh there's nothing like deserves to be remove something  
**Wouter \- Powerhouse:** So for for  
**Yasiel \- Powerhouse:** just I I also added this building cycle level.  
**Wouter \- Powerhouse:** the  
**Yasiel \- Powerhouse:** I don't know if it looks good. You see okay with that or  
**Wouter \- Powerhouse:** Yeah, I think it's actually Yeah, that works. Let's keep it. I wasn't sure because you do see that it like you know it also toggles right so you see the building built quarterly built annually oh let's change the let's make it both uh end with the uh lee so annually quarterly annually uh this continue button too we  
   
 

### 00:10:57 {#00:10:57}

   
**Yasiel \- Powerhouse:** Okay.  
**Wouter \- Powerhouse:** can make it a lot wider like uh double double the the padding yeah but only in  
**Yasiel \- Powerhouse:** This one.  
**Wouter \- Powerhouse:** the only the horizontal padding.  
**Yasiel \- Powerhouse:** Okay. This will be applied only for this step or for all of the ST because I believe it  
**Wouter \- Powerhouse:** Yeah.  
**Yasiel \- Powerhouse:** should be done for all the step because it's the basically the same the same  
**Wouter \- Powerhouse:** Yeah. Yeah. Yeah. Yeah.  
**Yasiel \- Powerhouse:** button.  
**Wouter \- Powerhouse:** All the  
**Yasiel \- Powerhouse:** Yeah. Okay.  
**Wouter \- Powerhouse:** steps.  
**Yasiel \- Powerhouse:** I think that's it.  
**Wouter \- Powerhouse:** All right. Um I also wanted to ask so the um the the client library that Kalus has been working on um if I'm not mistaken there was at least one like handover meeting or like workshop to uh to explain how it works right are we using that one now or or not for the  
**Yasiel \- Powerhouse:** Um, no no not yet.  
   
 

### 00:12:01 {#00:12:01}

   
**Yasiel \- Powerhouse:** Um,  
**Wouter \- Powerhouse:** Go  
**Yasiel \- Powerhouse:** we have to we have to plan that to interate the login.  
**Wouter \- Powerhouse:** ahead.  
**Yasiel \- Powerhouse:** Um, so we can login. Um maybe we need to do some uh changes in the in how we interact with the data because right now we are just fetching the data. But when we have um when we need to to basically need to execute some mutations that need to be signed we are doing that server side right now. Um but that can be done in server side because we need designer and that only can uh be is available in the in the client. So we also need to change things in the architecture and how we we're interacting with the  
**Wouter \- Powerhouse:** Yeah. Yeah. Yeah. Yeah.  
**Yasiel \- Powerhouse:** data.  
**Wouter \- Powerhouse:** Okay. So, I I think that's already that's one that we can work on. Um I would definitely keep it as a feature toggle the the login.  
   
 

### 00:13:07 {#00:13:07}

   
**Wouter \- Powerhouse:** Um but uh yeah, we'll we'll we'll need it soon and it's important that we have like that back end integration um cleaned up and that we're able to uh to sign uh yeah sign sign operations or mutations. So that's one. Um then the next thing  
**Yasiel \- Powerhouse:** There we go.  
**Wouter \- Powerhouse:** um yeah should should we look at the um do we have a a subscription page that is uh working that we can look at for um closing the billing cycle.  
**Apeiron \- Powerhouse:** Are you referring to the instance documents or  
**Wouter \- Powerhouse:** Yeah. Yeah. The the service subscription instance documents.  
**Apeiron \- Powerhouse:** or  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** yeah, I mean the ones that are currently in um let me share the screen. uh the ones that are currently in powerhouse RGH but okay so we are talking about these files here um not quite yeah so these files and and this is the instance one um and this is the dashboard  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** for the operator  
   
 

### 00:14:46 {#00:14:46}

   
**Wouter \- Powerhouse:** Yeah. Okay. Um Yeah. Let's look at the subscription page first. So the instance  
**Apeiron \- Powerhouse:** Okay. Uh so this is the subscription instance client view and operator view. I mean again these the switching here should not be this easy but yeah for sake of yeah so right now client view and operator view operator can pause  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** it. Um yeah we said we're going to have this projection wording and yeah let's see if this works.  
**Wouter \- Powerhouse:** Heat.  
**Apeiron \- Powerhouse:** So if I have 53 and 50 max and let's say if I go above I should right now I'm again not not sure why this uh yeah so here we should see the dynamic cost uh because we  
**Wouter \- Powerhouse:** But you're you're not over the 05 is free.  
**Apeiron \- Powerhouse:** are yeah five is free you should see that but we have I  
**Wouter \- Powerhouse:** Okay.  
**Apeiron \- Powerhouse:** mean not sure what happened there. Um because I was Yeah, I don't know.  
   
 

### 00:16:03 {#00:16:03}

   
**Apeiron \- Powerhouse:** Um just have to do my homework and and really dig this up to to make it ready for UAT. Uh totally on me. Um kind of slip through the fingers because I thought we had it, but now it's we don't have it. So yeah, I'm going to take a deep dive uh first thing uh yeah, potentially this today and tomorrow morning. But yeah,  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** I have no answers.  
**Wouter \- Powerhouse:** But so what I want to talk about is the um so what happens when the billing cycle is closed. So if we go into the next billing cycle. So first of all um so let's have a look here. So we have um yeah so this is the okay so next payment and this is the next uh the next ending of the billing cycle right uh created March 5th and then on the last of the and of the so that that's not consistent, right? So the um the next payment here is uh it was created March 5th, 2026\. And uh the next payment shows us uh end of the so it it shows us April 4th.  
   
 

### 00:17:47 {#00:17:47}

   
**Wouter \- Powerhouse:** Uh that could be if it's a monthly billing cycle, but this is an annual bill building billing cycle, right? Um,  
**Apeiron \- Powerhouse:** Yeah,  
**Wouter \- Powerhouse:** so can we have a look at the at the document model and we can see the the business  
**Apeiron \- Powerhouse:** I'm just trying to fetch it.  
**Wouter \- Powerhouse:** logic  
**Apeiron \- Powerhouse:** But I'm always confused since I'm like Libram is is this the service offering repo or is it contributor building because contributor building has this installed packages.  
**liberuum \- Powerhouse:** Well, what do you want to look at? If you want to look at the document model and the reducers is a service offering.  
**Apeiron \- Powerhouse:** Uh okay. Can you give me like five minutes? I I'm I have to take care of the little one. Um  
**Wouter \- Powerhouse:** Good.  
**liberuum \- Powerhouse:** I can share the service offering.  
**Wouter \- Powerhouse:** Yeah, that's how I'm looking.  
**Apeiron \- Powerhouse:** Yeah. Okay, I'm back.  
**liberuum \- Powerhouse:** So, I didn't push some changes yesterday or today even updated to the latest latest and trying to test things out.  
   
 

### 00:19:31

   
**liberuum \- Powerhouse:** So logic for the subscription instance. Yeah. So here's the schema. What do we want to look  
**Wouter \- Powerhouse:** The um the operations that are defined,  
**liberuum \- Powerhouse:** at?  
**Wouter \- Powerhouse:** especially the the state transitions  
**liberuum \- Powerhouse:** Initialize initialize. There's a bunch of initialized operations state transitions between uh when we change um what was it from ready to view or  
**Wouter \- Powerhouse:** Right. So the one no um I I guess it's not even state transactions is the um so the closing of the billing  
**Apeiron \- Powerhouse:** from building cycle  
**Wouter \- Powerhouse:** cycle.  
**liberuum \- Powerhouse:** Wait, one at a time. Closing of the building  
**Wouter \- Powerhouse:** Yeah.  
**liberuum \- Powerhouse:** cycle.  
**Wouter \- Powerhouse:** So for examp like this subscription for example could have a monthly bank cycle right and  
**liberuum \- Powerhouse:** So cycle recurring  
**Wouter \- Powerhouse:** um  
**liberuum \- Powerhouse:** goals. So we have an update operation  
**Wouter \- Powerhouse:** yeah it's probably going to be this one here.  
   
 

### 00:21:06

   
**liberuum \- Powerhouse:** here  
**Wouter \- Powerhouse:** So, the uh reports  
**liberuum \- Powerhouse:** and you can look at the history area and see like what what dispatch is called.  
**Wouter \- Powerhouse:** uh  
**liberuum \- Powerhouse:** When you do let the editor change so you can pinpoint  
**Wouter \- Powerhouse:** yeah, so it's this one here, the the report recurring payment and uh yeah,  
**liberuum \- Powerhouse:** it.  
**Wouter \- Powerhouse:** I guess the report setup payment too. So when that happens the um so what what that means and I think payment here is um yeah either it's the wrong term or um or we need another one. Um, so let's say it's like the you have a monthly billing cycle, you're um you're charged like uh every second of the month. So that's I think what report recurring payment does, right? It um it resets  
**Apeiron \- Powerhouse:** I don't Yeah, I now I'm looking at my repo and I don't think we have the the reset mechanism. Um, it's just reading from the service offering and that's it.  
   
 

### 00:22:45

   
**Apeiron \- Powerhouse:** And yeah, um, I I don't see it.  
**Wouter \- Powerhouse:** Well, then let let me ask a question another way. So, um what is it that moves the next payment uh date to uh to the next billing cycle? So, if to like if uh if we're doing a payment today, we're the 9th. Uh if the billing cycle ends today then um what operation do we submit so that then the the next the so then it becomes the the the 9th of May right so because today it's the 9th of April uh so what operation uh bumps that to the 9th of May and and what does it uh what which calculations and what how does Update the  
**Apeiron \- Powerhouse:** Yeah. So, we have the report recurring payment.  
**Wouter \- Powerhouse:** data.  
**Apeiron \- Powerhouse:** Sorry again if you if you hear the the hellish voice behind me. Um, we have the report recurring payment but yeah uh it does not yeah advances the billing date.  
**Wouter \- Powerhouse:** Can we have descriptions of the operations, right?  
   
 

### 00:24:08

   
**Apeiron \- Powerhouse:** Uh  
**Wouter \- Powerhouse:** Can can you look at the actual uh the document model specification?  
**Apeiron \- Powerhouse:** yeah, sorry. Okay. Um, there seems to be an issue with the pad, but yeah. Okay. So, we want to look at the the qu model specification. So I should I spin up the vetra drive or are you okay if I share the local graphical schema  
**Wouter \- Powerhouse:** No,  
**Apeiron \- Powerhouse:** or  
**Wouter \- Powerhouse:** I want to look at the descriptions of the operations. So that's in the uh in in the docken model specification in vetra.  
**Apeiron \- Powerhouse:** okay spinning up retro I I did um share this uh but again yeah uh we have these state transitions as well. I showed it in the call chat. So this is basically mapping between resource and subscription instances. Um let's  
**Wouter \- Powerhouse:** Yeah, we can look at this first. So, um,  
**Apeiron \- Powerhouse:** see.  
**Wouter \- Powerhouse:** uh, how was it again?  
   
 

### 00:26:36

   
**Wouter \- Powerhouse:** Yeah. So,  
**Apeiron \- Powerhouse:** So uh we have uh resource instance is draft provisioning when the call is happening. So the onboarding call the one that we have currently like a black box uh on our like front end or like yeah but just like we are onboarding the user into connect and during the provisioning call this instance the resource instance that is basically just holding this metadata of a re like what were  
**Wouter \- Powerhouse:** No.  
**Apeiron \- Powerhouse:** the uh the facets and which product it's can be activated and I think yeah it can also be suspended and resumed. So you're suspending it if you have a reason. You can also terminate it if you have a reason that you know you want to suspend it. Basically potentially they're not paying. Um so these are the detailed transitions. We we don't want to look at this because the billing cycles are at a subscription instance. Um okay I have betra set up. uh try here and subscription instances here.  
   
 

### 00:27:59

   
**Apeiron \- Powerhouse:** Hope this will work. So we have  
**Wouter \- Powerhouse:** Yeah, let's look at the at the state schema first because um I I need to remind myself.  
**Apeiron \- Powerhouse:** initialize  
**Wouter \- Powerhouse:** So, we have a customer ID, name, email, type, uh individual or team. Yeah. Living uh operating operator service offering. Yeah. Tress currency.  
**Apeiron \- Powerhouse:** This is the selected building cycle from you know the payload from  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** Acra.  
**Wouter \- Powerhouse:** And billing cycle. Is that just an enum or is it um is it the data?  
**Apeiron \- Powerhouse:** I don't think it's an Yeah, it's an  
**Wouter \- Powerhouse:** Yeah. Okay.  
**Apeiron \- Powerhouse:** enum  
**Wouter \- Powerhouse:** So, um,  
**Apeiron \- Powerhouse:** renewal date, but  
**Wouter \- Powerhouse:** wait, I was at the bottom there. Next, next billing date, projected bill amount, projected currency. Yeah. And then the services and the service groups. Mhm. Yeah.  
   
 

### 00:29:40

   
**Wouter \- Powerhouse:** I I think projected billament is not um it's not quite projected, right? It's more um yeah, we said like that's it's a good name on the one hand because it it shows that it there's still going to be added to it. Um but it's more like unsettled like unsettled pill, right? So we don't need to immediately change it, but that's that's what it is. It doesn't calculate like what the bill will be at the end of the billing cycle.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** It it calculates what you've stacked up so far, right? Um and  
**Apeiron \- Powerhouse:** Hey.  
**Wouter \- Powerhouse:** then so how how does that one get updated? Which uh which operation does does uh updates that one?  
**Apeiron \- Powerhouse:** the projected V amount or like unsettled.  
**Wouter \- Powerhouse:** Yeah, I think that's the same thing, right? So yeah, that that one.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Wait, so so let's have a look. Um, initialize. Yeah.  
   
 

### 00:31:02

   
**Wouter \- Powerhouse:** Where's the the other one?  
**Apeiron \- Powerhouse:** This is setting  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** the  
**Wouter \- Powerhouse:** Activate pause. Yeah. Expiring. Um,  
**Apeiron \- Powerhouse:** doing.  
**Wouter \- Powerhouse:** so a subscription is expiring if it was cancelled, but it's still active. It's still in the in the active billing cycle. Or when is the subscription  
**Apeiron \- Powerhouse:** Uh yeah, you have it here like renew.  
**Wouter \- Powerhouse:** expiring?  
**Apeiron \- Powerhouse:** Uh yeah, potentially some like I mean yeah, still need to refresh my memory on it on this uh whole thing,  
**Wouter \- Powerhouse:** Yeah. Okay. So then all of those are just like updating data and then further  
**Apeiron \- Powerhouse:** but  
**Wouter \- Powerhouse:** down. Yeah. Set to print mode renew. Auto  
**Apeiron \- Powerhouse:** uh we had this um in the UI.  
**Wouter \- Powerhouse:** renew.  
**Apeiron \- Powerhouse:** But um I think we decided to not not show it. Um there was this kind of boolean like a button uh for auto  
   
 

### 00:32:27

   
**Wouter \- Powerhouse:** Okay. And then renewal date.  
**Apeiron \- Powerhouse:** renew.  
**Wouter \- Powerhouse:** Yeah. Uh, auto renewal makes sense, right? I mean, I'm not talking about the UI. I'm just talking about the business logic. Um, what is the renewal date? So that is the that is the date that the next billing cycle goes in.  
**Apeiron \- Powerhouse:** Yeah, but you have to kind of set it. Um, so again, maybe this  
**Wouter \- Powerhouse:** So renew is actually is maybe the the  
**Apeiron \- Powerhouse:** is  
**Wouter \- Powerhouse:** operation that um that triggers the next billing cycle. Yeah. Here. Update billing projection. Yeah. But that's not um next billing date. Yeah. Okay. So, we're like injecting a injecting the new date. Um but the amount should be calculated, right? Can can you scroll down? So the services. Okay.  
   
 

### 00:34:09

   
**Wouter \- Powerhouse:** All right. Now we're getting to report setup payments. Um, so that's a payment that happened and that that presumably it it reduces the amount that is due, right? So if you um yeah go further report recurring payment. Yeah. Okay. Um, service facet selection. Yeah, that's just uh to to have all the service information there, which isn't I don't know if that one should be relevant for for the um with the subscription, but uh yeah. Okay. And then add service group. Yeah. So, so far we have two things. We have the renewal mechanism and we have the payments that get reported and I think that that can work. So if you if you scroll down further is there anything else about like uh uh service group remove update. Oh wait uh add service metric. Yeah update metric uh yeah uh update metric usage right.  
   
 

### 00:36:20 {#00:36:20}

   
**Wouter \- Powerhouse:** Um increment metric usage. Yeah. Yeah. Yeah. Uhhuh. And then anything else or that's that's the last one? A decrement. That's it. Okay. So, um, can you go back to the renew operation?  
**Apeiron \- Powerhouse:** It's  
**Wouter \- Powerhouse:** Yeah, but set auto renew, that's just a toggle. Set renewal date is when the current billing cycle is going to be closed. But so it's missing the Umtle.  
**Apeiron \- Powerhouse:** It's missing the operation.  
**Wouter \- Powerhouse:** Yeah. Like settle.  
**Apeiron \- Powerhouse:** Advanced billing cycle operation or something like that should  
**Wouter \- Powerhouse:** Yeah. Yeah. Yeah.  
**Apeiron \- Powerhouse:** be  
**Wouter \- Powerhouse:** Yeah. Okay. So that uh so we like we'll need to describe exactly what happens when the billing cycle proceeds and um and so that we need to turn that into a uh into reducer right. So if you um and we talked we we talked about like you know it it used to have bills, right?  
   
 

### 00:38:26 {#00:38:26}

   
**Wouter \- Powerhouse:** Um but uh we want to keep the the complexity of of actual bills out of the document model.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Uh but on the other hand, you do want to use the subscription docking model to calculate what the actual bill is that we and so but that could be with um uh so that could be with like a query function where you you take the current um yeah you take the the current uh state of the document And then you calculate what the um what the next billing cycle result is or like the current building cycle result when it closes when it settles  
**Apeiron \- Powerhouse:** Yeah, I mean you you basically have this cascading thing going on where metrics are reset if assuming that metrics reset cycles are aligned with the billing cycles. So  
**Wouter \- Powerhouse:** Yeah. So I think what what you what you would do at the end of the billing cycle is you would um so you would make sure that  
**Apeiron \- Powerhouse:** that's  
**Wouter \- Powerhouse:** the anything that impacts the uh the cost that is stacked up and we're talking about like we're looking at a specific date, right?  
   
 

### 00:40:05

   
**Wouter \- Powerhouse:** So um so if today is the end of the billing cycle um and I I honestly I don't know if um we should even assume that the billing cycle is followed according to the rules. Uh there will be situations where you want to just close the billing cycle prematurely for example or um we've just been lagging and it's like you know two weeks extra and like it was supposed to be built monthly but it's actually 6 weeks and we want to build now. Um so what is the what is the formula like how do you calculate uh so based on the information in the document. How do I calculate and this is this is the the thing that we need to bring in the document model because this is the most important um piece of business logic. So the the update billing projection. Um, so that that should I mean it can have a a bill amount and currency, but um at least we we should have a a function that calculates the um the yeah like how much we've uh how many costs we've uh we've stacked up until a certain date, right?  
   
 

### 00:41:41

   
**Wouter \- Powerhouse:** the um where is the previous billing cycle like when did the current billing cycle start  
**Apeiron \- Powerhouse:** Uh to be honest, I think yeah, it's yeah, we didn't spend so much time on this one and now you're asking questions about yeah organic questions about billing cycles and yeah there like we cannot account for um multiple billing  
**Wouter \- Powerhouse:** No, no, but yeah, it's not it's not complete yet,  
**Apeiron \- Powerhouse:** cycle  
**Wouter \- Powerhouse:** but um that's why I'm talking about it now because now we need to make it complete.  
**Apeiron \- Powerhouse:** yeah okay we don't I don't  
**Wouter \- Powerhouse:** So um I think we don't have the the start of the current building cycle yet,  
**Apeiron \- Powerhouse:** know.  
**Wouter \- Powerhouse:** right? It's not implied or not here yet, right?  
**Apeiron \- Powerhouse:** I think um I think it's implied with with the um not really sure. It's a bit vague but I think it's imp implied at least from transitioning from resource instance into uh activating this instance triggers the activation of subscription instance and this could be  
   
 

### 00:42:57 {#00:42:57}

   
**Wouter \- Powerhouse:** Yeah. So,  
**Apeiron \- Powerhouse:** the  
**Wouter \- Powerhouse:** so I think activation is like the the the first billing cycle that kicks in,  
**Apeiron \- Powerhouse:** Yeah. Yeah.  
**Wouter \- Powerhouse:** right?  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** And so at at that moment you owe the fixed costs and you owe you start owing the recurring cost.  
**Apeiron \- Powerhouse:** the recurring one.  
**Wouter \- Powerhouse:** Um and then there is a very basic question.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Do you owe the recurring cost at the beginning of the billing cycle or at the end of it? In other words,  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** do you pay do you pay in advance? Uh yes. Right. So you pay in advance. So in other words, you at the moment that the subscription is activated, you owe two things. The fixed cost and uh the first the cost of the first  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** cycle. But the cost of the first cycle and that's where it um yeah.  
   
 

### 00:43:57 {#00:43:57}

   
**Wouter \- Powerhouse:** So that that would that's not consistent, right? Because the the the cost is dependent on the usage. So we can't know yet what the usage will be at the end of the  
**Apeiron \- Powerhouse:** But do you have dynamic costs? So you have you have so you're up paying up front like if you're on your onboarding call uh  
**Wouter \- Powerhouse:** cycle.  
**Apeiron \- Powerhouse:** provisioning call you're paying up front you're activating the subscription you're paying up front for the free like included you know free limit. And then of course there there should be also a disclaimer like if you go above it uh you will be charged additional orage at the end of the billing cycle. If not you're covered for the next billing  
**Wouter \- Powerhouse:** Yeah, that that sounds right. So you you owe the fixed cost,  
**Apeiron \- Powerhouse:** cycle.  
**Wouter \- Powerhouse:** you owe the the setup cost on activation,  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** right? You owe the setup cost and you owe  
   
 

### 00:44:40 {#00:44:40}

   
**Apeiron \- Powerhouse:** Activation.  
**Wouter \- Powerhouse:** the fixed cost of the services that you've that you've included.  
**Apeiron \- Powerhouse:** that are included in the free limit.  
**Wouter \- Powerhouse:** Yeah. The so the moment that  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** you activate an additional service like either we don't allow that or like when the prices changed. Um, so we need to figure that out. Like is it like your um when you so when you activate it the first time and then when you enter the next billing cycle um doesn't mean that like the contract is fixed until the next billing cycle. So what typically happens is like if you for example you have like Dropbox subscription or something right and you add a user you add a seat um so what's going to happen is it's going to charge you immediately going to charge you pratta for the for the ongoing billing cycle like that's how complicated it is right so if if if the billing cycle starts and I have like two seats in my subscription I'm going to be charged one billing cycle for two seats.  
   
 

### 00:46:09

   
**Wouter \- Powerhouse:** If assuming that that's like a part of the non-dynamic, not the overage cost, right? If three days in I decide to add a third seat, I'm going to immediately pay um the prata cost of the third seat for that billing cycle, right? So, or like if it's if it's a if it's a month of uh of 30 days and we're 10 days in, I'm going to I'm I'm going to a 2/3 right for the 20 days that are still remaining. Um, if I'm if I'm removing a seat, the prora cost is deducted. It's like putting credit. Um, so at the end of the month, uh, I'm going to pay the overage costs minus the, uh, the deduction the pro this deduction of the of the seat that I removed. Yeah. So, so that mechanism you need to describe it exactly like you know what happens upon activation, what happens upon cancellation. Cancellation is pretty simple. It means you just don't renew the cycle. That's it.  
   
 

### 00:47:38 {#00:47:38}

   
**Wouter \- Powerhouse:** And you can't um from the moment you cancel there can't be any additional usage. That's that's it. So you need to um and I think so what we'll need to do is we need to uh we need to keep a record somewhere of um these uh these changes uh because we have a lot of like for example some of the some of the metrics And it's it's not even it's not even the same depending on which service you're talking about, right? So if you have an uh an AWS account and um that is different than adding a a Dropbox seat um so if I'm adding a new server, I'm not paying anything. It's just pure overage cost that is built at the end of the of the of the billing cycle. Everything in a way is is an overage cost. Um but if I'm if I'm adding a a seat in Drawbox, it increases the the included um the included uh usage metric.  
**Apeiron \- Powerhouse:** Yeah. And just to be clear,  
   
 

### 00:49:12

   
**Wouter \- Powerhouse:** Right.  
**Apeiron \- Powerhouse:** we haven't yet uh accounted for like currently the subscription instance is not a how do you say like a except for the metrics uh edits. It's not a write only. It doesn't have any like you cannot add stuff or like currently you cannot increase like per seat we don't have this you cannot currently add new service groups to an existing subscription  
**Wouter \- Powerhouse:** Yeah. But so yeah, so that's the like that's a business analysis that needs to happen like um so we so you need to figure that out that that that mechanism that I that I just started describing, right? Uh and it ties back to what is included. Um so if and so yeah so you should describe like what happens if the what did we call again the two we already had the two limits like  
**Apeiron \- Powerhouse:** the free and it's a free limit and  
**Wouter \- Powerhouse:** the  
**Apeiron \- Powerhouse:** um free usage limit and  
**Wouter \- Powerhouse:** an included limit or something.  
**Apeiron \- Powerhouse:** included.  
   
 

### 00:50:28

   
**Apeiron \- Powerhouse:** Yeah, because it is paid.  
**Wouter \- Powerhouse:** Oh, that's the  
**Apeiron \- Powerhouse:** It is paid but it's included in the tier because we're not going to allow for  
**Wouter \- Powerhouse:** same.  
**Apeiron \- Powerhouse:** infinite you know usage within a tier.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** So at one point you will have to step uh yeah it's free and it's included.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** This is uh  
**Wouter \- Powerhouse:** Yeah. Yes.  
**Yasiel \- Powerhouse:** I I I think that there is like as I said like three different um kind of having the the villain. One would be like me that is the example that you mentioning about others could be the same for utilities like okay we measure what you use um at the end of the village center we charge the we charge you that either at the end or at the beginning uh well at the beginning it's impossible because uh we need to have  
**Wouter \- Powerhouse:** Yeah.  
**Yasiel \- Powerhouse:** something like API AI API code that you need to like add some reserve credits or something.  
   
 

### 00:51:32 {#00:51:32}

   
**Wouter \- Powerhouse:** Yeah. Yeah. Yeah. But that that's that's exactly what we're talking about.  
**Yasiel \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** So the um there's two there's two limits that we define. One is the uh the included amount. So that is the free limit and the other one is the the maximum amount. And the maximum amount is is really doesn't mean anything other than you can't have usage beyond uh the the maximum amount the maximum limit. And uh at the end of the billing cycle what you are charged is the difference between your usage which cannot go above the the maximum amount and minus the free limit that you prepaid for. Right? So that's that's the I think that's the the key mechanic. So um so for example if uh yeah and free tier doesn't mean like free is is maybe uh is misleading because of course you're paying for it. It's just that you already paid for it. So once you've paid it's free.  
   
 

### 00:52:39

   
**Wouter \- Powerhouse:** Uh so um that's like included right? So that that's the included threshold. So what is included in the prepayment? Um and then what what was the usage that was more than the included one? So the overage um and at the end of the billing cycle you pay for the overage of the previous billing cycle and you pay the um get a fixed cost for um or the fixed price for the um for the next billing cycle. Um and so I think um so I don't think there's any way around like we will need to and I think the report payment um operations are are already good start there. So they they reduce your debt, right? So you will have to keep track of the debt that was built up. And so the moment that the subscription gets activated, the a bunch of stuff is added to the debt, which is on activation, you still need to pay um the the setup cost, the onetime cost.  
   
 

### 00:53:53

   
**Wouter \- Powerhouse:** So that immediately activates and then you pay the um you pay the fixed monthly price for the for the included usage and then at the end of the billing cycle the debt is increased with um the the overage usage. Plus, if if the cycle renews because auto renewal is on um or you you actively renew it, then um uh then you also add the the fixed price for the next cycle and then your um your usage uh may or may not drop back to zero. Um so let's uh let's think of that because that's that's also an important thing right so some usage metrics they reset and other usage usage metrics they don't reset uh so for example the number of seats doesn't reset right so you uh but yeah wait seats is a seats is a limit seats is an included limit but if you're using three seats today unless you change something like next month the the usage is still going to be three, right? Um that is not the case with um with yeah things you consume like uh indeed like uh compute hours or something, right?  
   
 

### 00:55:28 {#00:55:28}

   
**Wouter \- Powerhouse:** So compute hours they build up and then they reset. And so we had a discussion about the the difference between the reset cycle and the billing cycle because the reset cycle do we set it per um per metric I believe so right.  
**Apeiron \- Powerhouse:** Yeah, you can you can um you can set reset cycles on a metric level. Yeah.  
**Wouter \- Powerhouse:** Yeah. Okay.  
**Apeiron \- Powerhouse:** And  
**Wouter \- Powerhouse:** So can you Yeah. Can you do the analysis of that and um and and then Yeah.  
**Apeiron \- Powerhouse:** it's  
**Wouter \- Powerhouse:** and and then we'll use that to uh uh to to add to the document model uh  
**Apeiron \- Powerhouse:** Yeah. So two things here.  
**Wouter \- Powerhouse:** reducers.  
**Apeiron \- Powerhouse:** So right now what I'm showing here. So currently uh what I'm showing here this is not um this is what I have like a it's kind of a blocker. I'm not sure maybe the room can help me out. So this is the um the correct staging that I'm showing here.  
   
 

### 00:56:36

   
**Apeiron \- Powerhouse:** And in order for me to go through the whole flow like Acra, you know, everything, I need to have contributor building up, but not sure how to um edit and and change the  
**liberuum \- Powerhouse:** Yeah, I can help you off with that.  
**Apeiron \- Powerhouse:** device,  
**liberuum \- Powerhouse:** No worries. Like we can do that together in a session. That's a Yes.  
**Apeiron \- Powerhouse:** how change document models in in contributing because they're differently installed as Yeah,  
**liberuum \- Powerhouse:** Yes. No problem. And we can take that.  
**Apeiron \- Powerhouse:** that's that's one thing. A second thing is sure uh again yeah but maybe so when I was chatting with um with like we found this like billing utils but this is on the editor level and maybe it already has some of the logic that you um described Prometheus because this is taking on the editor level all the data that it gets from the service offering payload and kind um aggregates it into these um into these projections. Of course, it doesn't have the functionality of you know moving away from this billing cycle and starting a new one but still stacking up the metrics, stacking up the usage.  
   
 

### 00:57:47

   
**Apeiron \- Powerhouse:** Uh it kind of has this but again um again maybe it's something that we can look at already. This was done when like on the editor level of course. So but yeah uh maybe we can reverse engineer it into a document model um reducer logic I guess but um yeah no I'm yeah um in any case um it's clear what I need to do basically. Yeah.  
**Wouter \- Powerhouse:** Yeah,  
**liberuum \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** room.  
**liberuum \- Powerhouse:** So again this gets generated via the custom subgraph resolver mutation. So once you click on staging on acra where you want to buy a service you call this create products mutation. on that mutation we have a sequence of steps that we call on different document models and so on right so first create a drive for the user and populate with the instances on the user side but also we populate the instances on the RGH drive side right so we have basically the same files shinger cat living in both drives and this uh go back to the view on connect where you see the dashboard of payments and so that basically gets extracted right away from all the uh instance documents that are in the service descriptions folder.  
   
 

### 00:59:13 {#00:59:13}

   
**liberuum \- Powerhouse:** So if you click the browse files on the top right Uhhuh. these are all the document models that the dashboard basically reads from. So any change that either you as a RGH manager does on the instance documents as an administrator or the user himself makes a changes on his side. They of course are propagated into the document model and then um  
**Wouter \- Powerhouse:** Yeah.  
**liberuum \- Powerhouse:** posteriority dashboard reads from that document model.  
**Wouter \- Powerhouse:** Yeah.  
**liberuum \- Powerhouse:** That's the flow how it works.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** Yeah, I mean currently we  
**Wouter \- Powerhouse:** But that's so that that's great. The the problem with that is um the calculations that are involved there,  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** they're complicated, right? Like we just talked about how how complicated it is. And so that that complexity needs to be in the document model. And then you can so then indeed you can read from all those documents and they're synchronized and that's  
   
 

### 00:59:59 {#00:59:59}

   
**Apeiron \- Powerhouse:** Yeah.  
**liberuum \- Powerhouse:** Yeah, that means the reducers need to be updated.  
**Apeiron \- Powerhouse:** But Uh,  
**Wouter \- Powerhouse:** great.  
**liberuum \- Powerhouse:** That's it.  
**Apeiron \- Powerhouse:** so  
**liberuum \- Powerhouse:** because it reduces the environment state change.  
**Wouter \- Powerhouse:** Sorry.  
**Apeiron \- Powerhouse:** couldn't  
**Wouter \- Powerhouse:** Okay.  
**liberuum \- Powerhouse:** That means that like any calculation that we we perform either visually of course it has to be done  
**Wouter \- Powerhouse:** Repeat.  
**liberuum \- Powerhouse:** via the reducers because the reducers they change the state correctly either  
**Wouter \- Powerhouse:** Yeah.  
**liberuum \- Powerhouse:** called via the subgraph mutations as we discussed it's a essential pattern to develop right or via  
**Wouter \- Powerhouse:** Yeah.  
**liberuum \- Powerhouse:** editors it's the same state that's  
**Wouter \- Powerhouse:** Yeah. Yeah. Yeah. Indeed. Um there's there's one um one nuance to that. So the the kind of missing feature of the of the document models is um is derived values, right? So we had that in the in the invoice for example. And so one way you can deal with it is with those invariants is to just like if something changes then you then you recalculate all the derived values.  
   
 

### 01:01:07 {#01:01:07}

   
**Wouter \- Powerhouse:** But um that doesn't um that doesn't scale up very well. So if uh like for example any input value that changes all the time like uh the current time stamp for example, right? Uh well you can't update your document model every second to recalculate this state. So you then you need some like then you need a a pure query function a calculation function that you um you put in the utils and and that we've done al as well right so that I I I counted actually as part of the document model that those those calculation utils because they get bundled with it and you you use it to to calculate it. Um but if indeed if any of the yeah of the the state that is in the document if any of that changes uh and it needs to recalculate a bunch of related stuff in the document all that has to go through the through the reducers because that's how we keep our business logic um well definfined and in in with one source of truth, right?  
   
 

### 01:02:15 {#01:02:15}

   
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** Just just to note that currently this is not generating a team drive. it's landing you on the operator drive but uh yeah  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** so yeah just enriching the subscription instance document model of course helping like with the help of lium writing the utilus function I guess the same as we did for the service offering on  
**Wouter \- Powerhouse:** And and the and the additional U reducers.  
**Apeiron \- Powerhouse:** act yeah Yeah.  
**Wouter \- Powerhouse:** But but I mean this is a level of complexity like you will have to first like  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** do the analysis and like explain it  
**Apeiron \- Powerhouse:** Yeah. Yeah. Yeah. Of course.  
**Wouter \- Powerhouse:** but so this is not something you  
**Apeiron \- Powerhouse:** I'm not going to go um do this thing uh  
**Wouter \- Powerhouse:** can I mean you can't vibe code this uh you can  
**Apeiron \- Powerhouse:** any  
**Wouter \- Powerhouse:** um you can like yeah you can like you can generate tests or something but you can't you can't v code the actual business logic because it it has be exactly right.  
   
 

### 01:03:17 {#01:03:17}

   
**Apeiron \- Powerhouse:** Where's it  
**Wouter \- Powerhouse:** Um so um yeah so you'll need to uh to do the analysis on  
**Apeiron \- Powerhouse:** at?  
**Wouter \- Powerhouse:** that but I think what we just discussed is a good starting point. So the building cycle ends uh what happens and and in the be like before it can end it actually has to start the first time. First it activates and then you will need to keep track of your um your  
**Apeiron \- Powerhouse:** It's all  
**Wouter \- Powerhouse:** debt which is uh I which is I think um yes missing state  
**Apeiron \- Powerhouse:** transformation.  
**Wouter \- Powerhouse:** in the in the state schema. Uh and then when a payment happens you deduct the payment from the debt. And then it might also be that um if you do something like as I said like you cancel you reduce your um your limit uh you reduce your included limit throughout the month that it um uh then it it uh uh it it will probably like have to do some kind of prora calculation based on the the length of the business cycle or the building cycle rather.  
   
 

### 01:04:27 {#01:04:27}

   
**Wouter \- Powerhouse:** and um and and deduct that from your debt as well. And so yeah, so so what you should definitely do is you keep track of two metrics and two additional not metrics like two additional um uh state uh properties and one is the uh the total debt and the total credit. Yeah. And so the amount that is owed is always the difference between the total debt minus the total credit. And then at the end of the month you you update those two numbers. So at the end of the billing cycle I mean uh so you um yeah you you update the debt and then if the payment comes in you update the credit and so that's how you get to balance of zero. Yeah. So um okay that sounds good.  
**Apeiron \- Powerhouse:** Yeah. Uh, so is this like top priority just so I know regarding like jungling the  
**Wouter \- Powerhouse:** The first priority is the MVP launch.  
**Apeiron \- Powerhouse:** beat? Okay.  
   
 

### 01:05:39 {#01:05:39}

   
**Apeiron \- Powerhouse:** Okay.  
**Wouter \- Powerhouse:** This is the next thing.  
**Apeiron \- Powerhouse:** Mhm. I mean, it kind of ties into the MVP launch.  
**Wouter \- Powerhouse:** Um,  
**Apeiron \- Powerhouse:** If this doesn't isn't if this isn't polished, then Yeah. the whole flow has to work. Yeah.  
**Wouter \- Powerhouse:** the other room  
**liberuum \- Powerhouse:** Unrelated question but general question. MVP launch what what's the timeline? End of month and if so we're still running on V6 dev versioning. Are we planning to release V6 production and on the same day like do the MVP release and upgrade the packages  
**Wouter \- Powerhouse:** Yeah. No, no, no. Uh, so yeah,  
**liberuum \- Powerhouse:** like  
**Wouter \- Powerhouse:** you're right. So, we don't we can't have the timeline until um the uh yeah, until there is a release of the of the core packages, right?  
**liberuum \- Powerhouse:** Right.  
**Wouter \- Powerhouse:** But um but I mean so the launch like the actual official launch is one thing but minus the um minus the upgrading changes that are needed.  
   
 

### 01:06:52 {#01:06:52}

   
**Wouter \- Powerhouse:** The um like the function completeness is another thing right. And so function completeness yeah as soon as possible. Right. So for the MVP um that that is the uh yeah that that is the highest priority to get the MVP scope to function completeness and and like uh like full function completeness like uh so so the next step there is to um I know is like it's upgrades that are breaking things uh and of course like when when a new upgrade is needed we'll need to retest it but Um uh so we can do another round of UAT once the yeah once that final step on the Yakra uh platform is uh is working. And um  
**liberuum \- Powerhouse:** Yeah, I want uh our environments to run on vetra for the MVP,  
**Wouter \- Powerhouse:** yeah,  
**liberuum \- Powerhouse:** not on my uh vcoded digital ocean environment that hangs on a string.  
**Wouter \- Powerhouse:** right. Yeah. Yeah. Yeah. I I think we can do that.  
   
 

### 01:08:03 {#01:08:03}

   
**liberuum \- Powerhouse:** as a one request.  
**Wouter \- Powerhouse:** Yeah.  
**liberuum \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Yeah. But that's part of the upgrade then. Yeah. Yeah. Yes.  
**Yasiel \- Powerhouse:** Yeah. What what is missing from ac and we need to to compete before the or for the  
**Wouter \- Powerhouse:** um the public site we're pretty much there right so we did the UAT you made all  
**Yasiel \- Powerhouse:** MVP  
**Wouter \- Powerhouse:** those changes and there are still a bunch of uh open open feedback items this very last step what we just discussed with the um so with the with the box right and by the way that line I meant a vertical a vertical line that like connects the two boxes. Um, but that's pretty much I mean that's it. Like this this to me is is good to go. Uh, but yeah like uh with the with those feedback items still uh uh still finished.  
**Apeiron \- Powerhouse:** And the recent  
**Wouter \- Powerhouse:** And so there's going to be by the way there's going to be additional feedback about uh the footer and the documents that are needed.  
   
 

### 01:09:16 {#01:09:16}

   
**Wouter \- Powerhouse:** And this is strictly speaking is not even MVP but we'll include it in it because um we need it for um uh for our for our bank and for which brings me to the next point uh we need it for Stripe. So if we're um so yeah, we're already looking at the next phase, this is after the MVP, but the first thing we need when to open a Stripe account um to to integrate payments is um is a couple more legal uh documents, a bit more legal information on the website. So that so that's also still going to be added to the feedback uh items but the the UAT list for this site for the public site is um is pretty much there. And if you want uh so the framer homepage, we also want to to finish that one probably, right? And um  
**Yasiel \- Powerhouse:** Yeah. Yeah. I was just asking because um I'm I'm really low stats.  
**Wouter \- Powerhouse:** yeah.  
**Yasiel \- Powerhouse:** So I wanted to know what what else can I do with maybe what can I help with or anything because once I finish I expected to finish the the  
   
 

### 01:10:31 {#01:10:31}

   
**Wouter \- Powerhouse:** Yeah.  
**Yasiel \- Powerhouse:** homepage uh probably today. Uh I have a few other feedbacks and I don't have the login interation  
**Wouter \- Powerhouse:** Yeah. Yeah. Yeah.  
**Yasiel \- Powerhouse:** but  
**Wouter \- Powerhouse:** Yeah. But the login integration is is not even MVP anymore. So, so then but yeah,  
**Yasiel \- Powerhouse:** oh  
**Wouter \- Powerhouse:** so that means you you're moving on to the to the next uh batch of uh  
**Yasiel \- Powerhouse:** no  
**Wouter \- Powerhouse:** features and yeah, I would uh I would definitely uh recommend that you also get into the um because that's the biggest uh bunch of feedback that is still missing is the um uh it's it's the back end, right? So it's it's it's all the connect uh packages and so on, all the all the editors. So that's that's still going to have um yeah, there's there's still going to be work there, but we need to do the UAT before we know what the feedback  
**Yasiel \- Powerhouse:** Yeah. Okay.  
   
 

### 01:11:34 {#01:11:34}

   
**Wouter \- Powerhouse:** is.  
**Yasiel \- Powerhouse:** Uh yeah, then I'm going to get in touch with Lar and see if I can board in the the packages and see if  
**Wouter \- Powerhouse:** Yeah.  
**Yasiel \- Powerhouse:** I can help there too. uh then uh the the the the login will be out of scope for now.  
**Wouter \- Powerhouse:** The login is out of scope for the MVP.  
**Yasiel \- Powerhouse:** Yeah. Okay. Yeah. So once then Leon once I I finish the the homepage and  
**Wouter \- Powerhouse:** Yeah.  
**Yasiel \- Powerhouse:** the any UI item that comes up I'm going to to in touch with you to see what can to help there in the in the site.  
**liberuum \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Yeah.  
**liberuum \- Powerhouse:** Yeah. Definitely. We have a lot of packages and reactors I need to maintain.  
**Yasiel \- Powerhouse:** Yeah. Yeah. Going to the left  
**liberuum \- Powerhouse:** Darker side.  
**Yasiel \- Powerhouse:** side.  
**liberuum \- Powerhouse:** Exactly.  
**Wouter \- Powerhouse:** Um yeah and so we we have uh we have enough tasks then uh I already want to drop this one and again this is not obviously not MVP uh but that's going to be the next thing.  
   
 

### 01:12:37 {#01:12:37}

   
**Wouter \- Powerhouse:** So, um that's why I'm talking about the uh the billing cycle settlement for the subscriptions now uh because then we're going to uh to implement the Stripe integration to actually charge uh the credit cards. And so, um yeah, as uh as irony wills it, it's the it's called connect. It's the Stripe Connect. This is the the documentation and I I still need to figure out exactly which pieces of the API uh that will integrate, but I I really want to talk about it a little bit um because there's one thing that we need to very very clearly realize. Um so stripe connect is is a payment solution for marketplaces and um so the difficult thing about marketplaces is that why is it different and you see here like they have two categories it's like build a SAS platform or a marketplace what is the difference the difference is that a SAS platform it can be a shop right like uh but and It's exactly as described here. So you provide platform services to businesses that collect uh payments from their own customers.  
   
 

### 01:14:09 {#01:14:09}

   
**Wouter \- Powerhouse:** So this is talking to you as developers you're working to uh for Acra. If Acra is collecting payments on the Acra platform for itself, it's not a marketplace. It's a it's a SAS platform with a payment function. That's a web shop. What is it different with a marketplace? A marketplace collects payments from customers and automatically pay out a portion to the sellers or the service providers on the marketplace. So the moment that we have like third party providers on Acra that start charging customers through the platform, but we need to split up the platform fee and the merchant payment or like the service provider payment. Then you have a marketplace. And so from a legal point of view, it's that's way more complicated. Um and and so that's why yeah so so that's the next thing that we'll want to start um uh that we need to start looking into and so I see here like processing payments it's not like a web shop I mean that's what we need to research but so the first um so after the MVP the next one is the the milestone where we um where we have the the subscription settling the billing cycles, right?  
   
 

### 01:15:43 {#01:15:43}

   
**Wouter \- Powerhouse:** So what we just talked about. So then we know how much we want to charge and when and then in the first phase it will be acra.com the legal entity that will charge the user on the platform. So in that phase, we're still a SAS platform, but then what we want to get to is is the marketplace where third party providers can also um receive payments through the platform. And um so in other words, like this this gives us a very good overview of um kind of the different payment scenarios and uh and what the what the differences are. And it's uh there's a lot of complexity here. It's like it's exactly like the subscription payments and the you know we worked on the uh which which will also come back at one point but we'll we worked on the uh the road maps and like the you know calculation of the so so there's a lot of complexity here and if we put that in our document models then um that's yeah that that makes them valuable.  
   
 

### 01:16:50 {#01:16:50}

   
**Wouter \- Powerhouse:** So, um, so yeah, uh, I just wanted to to bring it up. Uh, if you, uh, you're looking for something different, you want to, uh, to look ahead a little bit, can already start reading up on this. So, we'll need to figure out, um, yeah, so we'll probably first do like SAS platform payments and then, uh, later we'll do marketplace payments. And um well uh yeah so so Stripe has has very good documentation so it's all explained here and they have a they have an example website um here explore the demo this one forever um And yeah, so I haven't actually finished the flow yet, but um but so I think this is an example marketplace where you would have like third party providers that get paid um minus the platform fee and so on and so on. And then yeah from a legal point of view the the question is like who who is contractually like working with whom and and who's paying whom officially and then if there is uh yeah if there is like a party in the middle then that is a money transmitter and so on and so on.  
   
 

### 01:18:22 {#01:18:22}

   
**Wouter \- Powerhouse:** all the fun stuff. But um but yeah, so so that's the question we need to be able to answer based on our subscription instance documents is the billing cycle ends. What is it that we're going to charge? And then um the yeah the the the integration that we'll be using for that is stripe. Uh does connect support web hooks what do you which uh do you mean powerhouse connect or strip  
**Yasiel \- Powerhouse:** Yeah, you use that. Uh,  
**Wouter \- Powerhouse:** connect?  
**Yasiel \- Powerhouse:** no, no, correct. I'll connect because uh I know that Stripes works in a lot of ways the hooking apps the the hooks to to events the the data.  
**Wouter \- Powerhouse:** Yeah. Yeah, sure. So, uh via switchboard is the reactor, right? So, the reactor is uh reactive. So, um uh we'll need to uh to figure that out. Um,  
**Apeiron \- Powerhouse:** Um this one like more like logistical uh question.  
**Wouter \- Powerhouse:** yeah.  
   
 

### 01:19:38 {#01:19:38}

   
**Apeiron \- Powerhouse:** Uh is this uh like when can you decide on the team that is going to be present on this call like at least one day earlier or like are we going to be the fixed team that is present on the call after the platforms call or like how is this going to work?  
**Wouter \- Powerhouse:** Yeah, I was planning to just put everyone optional and then in the in the call before this we decide who uh uh who joins the second  
**Apeiron \- Powerhouse:** Yeah. Okay. Okay. I I I see.  
**Wouter \- Powerhouse:** call.  
**Apeiron \- Powerhouse:** But yeah, it's just kind of hard for um for me because like yeah, I don't want to I want to be upfront with the babysitter and everything. But yeah, I will do my best. Uh but yeah, don't want to put my iPad in front of my four-year-old. Yeah.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** Okay. No, no, it's it's it's a it's a me problem. But yeah,  
   
 

### 01:20:25 {#01:20:25}

   
**Wouter \- Powerhouse:** Um,  
**Apeiron \- Powerhouse:** it would be nice to have like a one day up front that of course you cannot have because it's dependent on the platform score. Yeah, no  
**Wouter \- Powerhouse:** it it might it might work actually to do it on Friday is the same time.  
**Apeiron \- Powerhouse:** worries.  
**Wouter \- Powerhouse:** Uh, and then you have one day in between. And it might be useful for other reasons too. Um because then we can we can prepare a little bit based on  
**Apeiron \- Powerhouse:** Yeah, I mean I could I could also brush up on the service offering for in one day,  
**Wouter \- Powerhouse:** the  
**Apeiron \- Powerhouse:** but yeah, I mean I don't want to be the only, you know, uh reason for this change, but yeah, it would uh it would cover a lot of uh areas uh and more reasons for for one day Too strong.  
**Wouter \- Powerhouse:** Yeah, might be good for um for other reasons to to put it before the demo, but then yeah, then you have a planning call before the demo.  
   
 

### 01:21:18 {#01:21:18}

   
**Wouter \- Powerhouse:** So then, but yeah. Okay. Um yeah, I think that would work. So we we'll take it into account. Um it still has to be scheduled for next week. So u uh unless I I can think of some reason why that would be super bad, we'll we'll do that. Okay.  
**liberuum \- Powerhouse:** So the reason we integrate with stripe as um in between supplier of this uh marketplace services is mostly legal legality reasons right so we're not  
**Wouter \- Powerhouse:** No, actually not not at all. Um the reason why we integrate with stripe is because we uh so there's so you want to reduce the friction uh of uh of people paying and you need a payment solution that does actually support marketplaces and yeah there is a legal uh angle to it which is they need to work with they need to be good uh everyone needs to be able to pay us And um uh with any credit card or like a debit card or whatever. Um and um the yeah they need to like the payment solution needs to support uh global payments and they need to support the uh the legal entity that we're that we work with.  
   
 

### 01:22:44 {#01:22:44}

   
**Wouter \- Powerhouse:** Uh now that it's a UK limited entity it's uh it's much less of an issue than uh with the uh this association. But um uh but th this is this is mostly for paying convenience. So this is just like then you can charge people's credit scores. Uh what we what we'll do in the future is because this works for like subscriptions, right? With small amounts, relatively small amounts, but the fees are high. Um and so uh for the larger amounts so the um especially once we once we get back to the uh like the the projects and the milestones and the um so the the actual procurement platform the um then for the larger payments you use a different mechanism uh which uh which deposits stable coins in a in a smart contract and And you um you transfer the the stable coins instead and you do off on and off  
**liberuum \- Powerhouse:** Yeah, that's where I was getting at.  
**Wouter \- Powerhouse:** ramping.  
**liberuum \- Powerhouse:** Yeah, I see. So, it's hybrid approach, you know, global uh span but also  
   
 

### 01:24:05 {#01:24:05}

   
**Wouter \- Powerhouse:** Yeah.  
**liberuum \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Convenience because like people want to like the like no one is going to set up uh a multisig for um for a subscription payment of $10 a month. like no  
**liberuum \- Powerhouse:** Yep. Yep.  
**Wouter \- Powerhouse:** one.  
**liberuum \- Powerhouse:** Cool. Cool.  
**Wouter \- Powerhouse:** All right. Um so I think we uh the the priorities are clear, right? So, we have the the MVP scope uh for that. The there's still a few feedback items uh open and we're um we're working to make the UAT uh possible on the on on the the connect side as well. So, that's that's the first priority. And then after that we get into the post MVP scope which is our subscription instances. Um figuring out like what happens exactly at the end of a billing cycle how the metrics reset and how the how the debt and the credit is uh is stacked up. Um and then the next uh yeah the the the final connecting piece there will be uh the integration with Stripe so that we uh we can actually charge people's credit cards for um for veter hosting for for agents you name it.  
   
 

### 01:25:37 {#01:25:37}

   
**Wouter \- Powerhouse:** uh connect being UA ready includes a subscription instance building cycle. No, no, not really because the onboarding is the I mean yeah um we'll see where we can draw the line. So maybe it's enough to um to just show the subscription and then for example we we may hide um like we may hide some of the details for now and then do the billing manually. But this is um yeah this this like it's not uh it's not that we're going to do that for months, right? like immediately as we've done that then we move on to uh to to implement the building cycles. Yeah. So so I would say that that one is uh once the UAT is unlocked then um then that one is uh is the next priority.  
**Apeiron \- Powerhouse:** Yeah. Okay, great.  
**Wouter \- Powerhouse:** Sounds good. And yeah, so the login integration is also uh the subscription and the the instance building cycle is probably is more urgent than the um than the login for for Acron. All right. So, uh, I'm looking forward to the day that, uh, we can see some credit card payments coming. So, uh, excited.  
**liberuum \- Powerhouse:** Let's  
**Apeiron \- Powerhouse:** Yeah,  
**liberuum \- Powerhouse:** go.  
**Apeiron \- Powerhouse:** let's go.  
**Wouter \- Powerhouse:** All right. Thank you guys. See you next time. See you tomorrow.  
**liberuum \- Powerhouse:** Thank you.  
**Apeiron \- Powerhouse:** Bye-bye.  
**Yasiel \- Powerhouse:** All  
   
 

### Transcription ended after 01:27:40

*This editable transcript was computer generated and might contain errors. People can also change the text after it was created.*