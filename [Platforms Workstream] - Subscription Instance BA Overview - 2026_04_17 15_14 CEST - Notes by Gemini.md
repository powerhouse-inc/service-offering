# 📝 Notes

Apr 17, 2026

## \[Platforms Workstream\] \- Subscription Instance BA Overview

Invited [Apeiron - Powerhouse](mailto:apeiron@powerhouse.inc) [Wouter - Powerhouse](mailto:prometheus@powerhouse.inc)

Attachments [\[Platforms Workstream\] - Subscription Instance BA Overview](https://calendar.google.com/calendar/event?eid=NHAyOTUxcGw0N20xODRkY3FmZXYzN2p1cGYgYXBlaXJvbkBwb3dlcmhvdXNlLmluYw)

Meeting records [Transcript](https://docs.google.com/document/d/1t68k2bsD99WhHNAl4zVKH8RAfnZBXNfUroNaeEPu6EE/edit?usp=drive_web&tab=t.7fnqyf24ci3z) [Recording](https://drive.google.com/file/d/1TPZUH6XdpjAnL2abNsY3uQZ8JIN-Wds5/view?usp=drive_web) 

### Summary

Billing engine architecture walkthrough confirmed reducer use for calculations, leading to five defined debt types and a determined accrual cycle termination process.

**Billing Engine Architecture Validated**  
Subscription activation must implement an immediate charge, which confirmed the architecture’s correct use of reducers for complex calculations, ensuring they are testable and runnable. It was agreed that the only user input needed for activation is a time stamp, simplifying operation submission.

**Payment Operations Consolidation**  
It was decided to consolidate specific payment operations into a single, general report payment operation. This simplification ensures that reducers handle all subsequent credit and debt calculations, streamlining the payment settlement process.

**Debt Types and Accrual Defined**  
The team identified 5 necessary debt types: one-time setup, fixed upfront, dynamic overage, estimated usage, and reconciliation, requiring documentation for clarity. The billing cycle was defined as the hard stop that always terminates the accrual cycle, preventing carryover of accrued debt to the next period.

### Next steps

- [ ] \[Apeiron \- Powerhouse\] Update Payment Op: Add explicit amount paid parameter to the payment operation structure.

- [ ] \[Apeiron \- Powerhouse\] Consolidate Payments: Consolidate pay setup cost and pay recurring operations into a single report payment operation.

- [ ] \[Apeiron \- Powerhouse\] Label Metrics: Change metric designation in the editor from no reset cycle to non-cumulative.

- [ ] \[Apeiron \- Powerhouse\] Structure Debt: Implement structured debt accounting using labeled line items setup cost, prepayment, or dynamic payment.

- [ ] \[Apeiron \- Powerhouse\] Document Debt: Write list of 5 debt types identified. Create example paragraph illustrating each type specificity.

- [ ] \[The group\] Define Termination: Figure out process when accrual cycle ends prematurely. Spell out details of pro rata debt calculation and timing.

### Details

* **Walkthrough of the Billing Engine Structure**: Apeiron \- Powerhouse introduced the objective of walking through the "billing engine," which is composed of an editor on the right and the underlying logic, including document models and reducers, on the left ([00:00:00](#00:00:00)). The presentation was planned to cover activation, payments, metric usage, billing cycles, overage settlement, and mid-cycle prorations, using a master diagram as a guide ([00:01:21](#00:01:21)). The intent is to show how the system adheres to real-world practices established by companies like Stripe and Dropbox ([00:00:00](#00:00:00)).

* **Subscription Activation and Immediate Charging**: The discussion moved to activating a subscription instance, noting that the system follows the good practice of implementing an immediate charge upon activation, similar to Stripe, Zoom, and Dropbox. This secures a fixed amount of services for the entire billing cycle, which is currently set to quarterly ([00:02:56](#00:02:56)). The activation process involves logging an "active subscription operation" and using a reducer to calculate and sum recurring and setup services, writing the total debt state to the document model ([00:04:12](#00:04:12)).

* **Validation of Reducer-Based Architecture**: Wouter \- Powerhouse confirmed that placing complicated calculations inside the reducer is the correct approach, ensuring they are written, tested once, and runnable anywhere. They also validated that the only real user input needed for activation is a time stamp, as the system cannot assume the operation is submitted at the exact moment of activation ([00:05:33](#00:05:33)). Apeiron \- Powerhouse acknowledged that this confirms their current architecture pattern ([00:06:26](#00:06:26)).

* **Settling Payments and Operation Inputs**: Apeiron \- Powerhouse demonstrated manually marking payments as settled, which updates the total debt and total credit in the document state, resulting in a paid-up balance ([00:07:24](#00:07:24)). Wouter \- Powerhouse noted that the \`report setup payment operation\` is missing the parameter for the amount actually paid, which is necessary because the exact amount may not always be paid and concurrent systems mean the calculated amount could change before the operation executes ([00:08:40](#00:08:40)). Wouter \- Powerhouse recommended that the operation should only require the amount paid, with the reducers handling all subsequent credit and debt calculations ([00:11:54](#00:11:54)).

* **Consolidating Payment Operations**: Wouter \- Powerhouse suggested simplifying the payment structure by combining \`pay setup cost\` and \`pay recurring\` into a single, general \`report payment\` operation. This was discussed in the context of how dynamic costs, such as overages applied during a billing cycle, are managed and bundled into the next cycle for payment ([00:13:01](#00:13:01)).

* **Handling Metric Usage and Overage Accrual**: Apeiron \- Powerhouse showed that usage metrics, such as invoices, have a hard limit (e.g., 10 for the example shown) and that dynamic overage costs accrue during the billing cycle ([00:13:01](#00:13:01)). Wouter \- Powerhouse agreed with the approach of having dynamic costs accrue during the cycle, noting that there are different types of metrics, such as seats (which do not reset) and resource usage (which typically do reset) ([00:14:37](#00:14:37)).

* **Addressing Corrections for Metric Usage**: When metric usage is tracked, Apeiron \- Powerhouse and Wouter \- Powerhouse discussed that if a customer is overcharged due to a bug, the correction should be handled after the fact, typically through a credit or debt adjustment ([00:18:59](#00:18:59)). The subscription document model's purpose is to track what the system charges for usage, not to maintain a perfect historical record of usage, leading to the need for a specific operation for credit adjustments ([00:21:10](#00:21:10)).

* **Defining Metric Categories and Accrual Cycle**: The conversation focused on differentiating between cumulative metrics (which reset) and non-cumulative metrics (which stay at the same level) ([00:23:25](#00:23:25)) ([00:29:02](#00:29:02)). Wouter \- Powerhouse proposed using "accrual cycle" instead of "reset cycle" to describe the point at which accumulated usage is converted into a monetary amount and added to the customer's debt. This term is clearer because it applies to both metric types and aligns with the moment debt is accrued ([00:38:44](#00:38:44)).

* **Structuring Debt and Linking Accrual to Debt**: Wouter \- Powerhouse advised that the billing cycle should ideally be detached from the accrual cycle for simplicity, with the accrual cycle being the point where debt is calculated and added ([00:40:18](#00:40:18)). The consensus was that total debt should not be a flat amount but rather a structured amount with line items labeled to indicate the source of the debt (setup cost, prepayment, or dynamic usage from an accrual cycle) ([00:42:21](#00:42:21)) ([00:47:09](#00:47:09)). When payments arrive, they should follow a first-in, first-out rule, paying the oldest debt slice first ([00:45:52](#00:45:52)).

* **Billing Cycle Procedures and Dynamic Charges**: Wouter \- Powerhouse defined the billing cycle as the moment when fixed costs for the next period are added to the debt, and all accrued debt slices that have not yet been built are flagged as "now built" ([00:49:05](#00:49:05)). The risk of a long billing cycle (e.g., one year) is that dynamic usage debt could accumulate for a long time, leading to a large, unexpected bill, a scenario comparable to utility billing where estimates are billed monthly and settled yearly ([00:54:11](#00:54:11)). This suggested that the billing cycle might need to be shorter than the accrual cycle in some cases to manage dynamic charges ([00:55:11](#00:55:11)).

* **Introduction of New Debt and Credit Types**: The conversation introduced two new types of debt and credit: estimated usage and reconciliation. Apeiron \- Powerhouse noted that these items need to be tagged during the payload and service offering creation when the operator is defining metrics. Wouter \- Powerhouse agreed that there is currently no designated place to record the estimated usage, but suggested that the need for it arises if the billing cycle is shorter than the accrual cycle ([00:57:59](#00:57:59)).

* **Identification of Five Debt Types and Documentation Need**: Wouter \- Powerhouse summarized five types of debt that have been identified, clarifying that not all five are needed from day one. The identified types are: one-time setup cost, fixed upfront cost, dynamic overage cost, estimated usage cost, and reconciliation. Apeiron \- Powerhouse was tasked with writing an example paragraph for each of these types to ensure clarity is maintained over time ([00:59:08](#00:59:08)).

* **Need for Business Analysis Documentation**: Apeiron \- Powerhouse suggested the creation of a "business analysis master" document to serve as a central location for all components, reasoning, and analysis related to the current discussions. Wouter \- Powerhouse agreed that the progress was good and that the team is close to a final determination on the framework. The primary remaining concern is how to manage an accrual cycle that ends prematurely, such as due to a plan change ([01:00:35](#01:00:35)).

* **Accrual Cycle Termination and Pro-Rata Calculation**: When an accrual cycle ends prematurely (e.g., due to a change in plans), the amount is calculated pro rata, and the accrued debt is added to the queue. The billing cycle does not change when the accrual cycle changes; however, Wouter \- Powerhouse ultimately suggested that the billing cycle should always terminate the accrual cycle ([01:00:35](#01:00:35)). This means that if an accrual cycle is cut mid-month (e.g., at 40%), the accrued debt is paid, and the remainder of the charge for that billing cycle (the 60%) will still be paid at the end of the month ([01:01:54](#01:01:54)).

* **Non-Carryover of Accrual to Next Billing Cycle**: Apeiron \- Powerhouse concurred that the billing cycle acts as a hard stop, preventing the accrual from carrying over to the next billing cycle. Wouter \- Powerhouse concluded that nothing should be carried over unless absolutely necessary, citing the example of a utility bill as a scenario where carryover might be required ([01:01:54](#01:01:54)).

*You should review Gemini's notes to make sure they're accurate. [Get tips and learn how Gemini takes notes](https://support.google.com/meet/answer/14754931)*

*How is the quality of **these specific notes?** [Take a short survey](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=NUg_VHO4gFGcBf1LYrvmDxIXOAIIigIgABgDCA&detailid=standard&screenshot=false) to let us know your feedback, including how helpful the notes were for your needs.*

# 📖 Transcript

Apr 17, 2026

## \[Platforms Workstream\] \- Subscription Instance BA Overview \- Transcript

### 00:00:00 {#00:00:00}

   
**Apeiron \- Powerhouse:** Okay. So, we are going to walk through the what we can also call billing engine. Um on the right hand side we have the editor. On the left hand side we have the the logic that um goes into the editor both from the standpoint of yeah if is it like do we have a real world validation like how does stripe or other companies do it? uh we don't need to talk about reducers here but I have it I just mapped it out um from like what we have but they potentially are important because some of the rules as I mentioned yesterday are such that they are not baked into the document model schema and operations but they are like a platform rules but we can see how far we go but basically the presentation could be on the right hand side we go to the editor we see how it behaves we see what operations are logged and how everything functions and how basically everything then adheres to the real world good practices from established companies and how this is then of course uh grounded in our code reducers uh and and other structural um um schemas from from document models.  
   
 

### 00:01:21 {#00:01:21}

   
**Apeiron \- Powerhouse:** So this is how we can proceed. Um I have a little bit smaller uh uh screen but I was also hoping and this is for my own sake Prometheia. So going forward um we have like like a business analysis is I mean I know document models are super nice business analysis um um artifacts. they kind of like are like they're kind of like a state machine diagram on steroids but going forward I think it would be good if I could also produce this kind of um master diagrams but uh we don't need to dive deep into this diagram but this is just going to basically uh how we are going to go through the editor so first is activation then payments then how the metrics are used the the billing cycle settlements how the overage is settled uh the mix the mid cycle prorations and how we are doing it like with like what what is the formula for it uh etc etc so maybe this diagram is helpful but I cannot show everything at once but everything that I'm showing you here is basically what we can go through there um but yeah uh let's let's get on with it and you'll see how things uh and so for example these formulas and these um these calculations functions basically like this like current usage uh like orange is maximum zero or usage free.  
   
 

### 00:02:56 {#00:02:56}

   
**Apeiron \- Powerhouse:** So this is basically calculating uh it can go it can't go below uh zero and if it's uh zero uh like if it's like if the usage is below free then you don't pay anything but if the usage is above free so these these things these are not document model things these are uh as you know of course more than me helper functions but let's go with the editor so editor is now open of course like client operator This is not an arbitrary choice, but yeah, currently I'm just going to switch to operator view. And now we talked about all of the stuff on the onboarding call and I am basically activating the um the subscription instance. And by doing this uh you'll see that some things are going to change. So right now we are now following the practice of stripe, the zoom and for example Dropbox. every all three of them basically have this kind of immediate uh charge on activation. I think Stripe has this kind of uh 20 hours for you to pay or something like that otherwise uh the status of the instance changes from active to some something else.  
   
 

### 00:04:12 {#00:04:12}

   
**Apeiron \- Powerhouse:** Not sure right now uh should be more uh yeah but right now we are following this good practice which I also think it's a good way to go like you're basically securing uh a fixed amount of services for the entire billing cycle whatever that is currently we are on the in the quarterly billing cycle and um this is basically what the activation does. So if we go into the into the um the operations we just have this kind of active since we don't have any maybe this is the wrong document mode pattern here you can run correct me but yeah we have the active active subscription operation locked uh but basically the reducer if I'm understanding architecture correctly. The reducer is doing the heavy lifting by yeah looping all the group services, summing all the amounts for recurring and setup services and displaying like and and writing basically the document model state which is like total depth. Uh we have the we have the uh field here, we have total depth here. So this is basically the state that the reducer then writes and then of course we have also the total credit state that uh another reducer is going to write when this is going to be paid.  
   
 

### 00:05:33 {#00:05:33}

   
**Apeiron \- Powerhouse:** So maybe this is the wrong approach, maybe not. Uh but  
**Wouter \- Powerhouse:** you know that's exactly that's exactly right. So this is what we want.  
**Apeiron \- Powerhouse:** yeah,  
**Wouter \- Powerhouse:** We want all the the complicated calculations inside of the reducer. Um so that uh we write it once and we test it  
**Apeiron \- Powerhouse:** nice.  
**Wouter \- Powerhouse:** and then we can run it anywhere right in your browser anywhere.  
**Apeiron \- Powerhouse:** Okay. Nice.  
**Wouter \- Powerhouse:** And indeed what is a real input.  
**Apeiron \- Powerhouse:** Nice.  
**Wouter \- Powerhouse:** Um a time stamp is exactly the right input. Why? Because the the one assumption we cannot make is that the document that the operation gets submitted the moment that the service actually activates, right? Uh so because it's yeah like an operation is just uh or an an action is just uh reporting on something that is happening or something that has happened or something that will happen. Um so you need that time stamp.  
   
 

### 00:06:26 {#00:06:26}

   
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** So this this is exactly right way to do it.  
**Apeiron \- Powerhouse:** Exactly.  
**Wouter \- Powerhouse:** Yep.  
**Apeiron \- Powerhouse:** And this is this is the only input that comes from the user basically the time stamp and and just just to  
**Wouter \- Powerhouse:** Yeah. Yeah.  
**Apeiron \- Powerhouse:** be 100% clear.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** So this is basically you Prometheus validating that our current powerhouse world that we are nurturing is giving us like this correct powerhouse pattern. So it's this is not manual work. I'm just going to be upfront with it. But yeah, I'm super thrilled that I'm basically learning while I'm doing it. And also we're getting these um architecture um confirmations that the LLM is yeah really harnessed and really tamed u within the powerhouse  
**Wouter \- Powerhouse:** Yep.  
**Apeiron \- Powerhouse:** um um stack basically. Okay. So right now operate operate like we just activated it with the only basically input from the user like we activated since a time stamp and now the the billing cycle is live.  
   
 

### 00:07:24 {#00:07:24}

   
**Apeiron \- Powerhouse:** Uh on the left hand side we have this uh for like like okay so again schema in doc models again is this and so we can now move to the next act basically which is uh payments for example. So let's see if I go here uh and this um and you will see so the payment is such so I think uh so yeah okay so midcycle services group add is equal to immediate pro debit to total debit not configurable per operator and uh and this is our limitation we can of course change it but pricing lives on service groups not individual services. So when an operator adds a service group midcycle, the group's recurring amount is prorated. You will see how this goes. Is prated for the remaining days in the cycle and added to total depth immediately. But yeah, let's first just try to settle the um uh settle the payments here. So I'm I'm like we don't have the billing the invoicing engine plugged in here. So I just now did the invoicing and I saw that bills were paid.  
   
 

### 00:08:40 {#00:08:40}

   
**Apeiron \- Powerhouse:** So here I'm manually marking them as paid and of course while doing this the total depth the total credit is changed in the doc state and now balance is paid up. Um I paid the setup cost.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** So this means that the fixed amount is 750 and the projected total for quarterly is 750\. So no more setup payments.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** Uh if I go here I have the again it's a report setup payment operation which has a service ID and the payment date. Other things are again reducer is reducers are doing the heavy lifting here.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** Basically the the back end like this.  
**Wouter \- Powerhouse:** Yeah. But so here we need another parameter which is the the amount that actually got paid and um so the reason is twofold. one is um you can't really trust that like the the the exact amount was paid like that. There are many reasons why uh they could have paid uh not enough or too much like um And there was another Yeah.  
   
 

### 00:10:10

   
**Wouter \- Powerhouse:** The other reason is um so even if they pay the exact amount we're dealing with um with concurrent systems here. So, and especially with like document models that um uh that can have operations that appear out of order and um so it could be that even though like you click on a button and this sounds um this sounds silly but that's but but with like branching and merging like that actually can can and will happen. Uh so it could be that by the time that so you click the button by the time that the operation is is um is is is actually calculated executed the um the amount already changed. Yeah. So let's say um let's say I do this as a user like and the payment uh payment integration is going to um it it's going to take some time right so it takes it takes it could take uh yeah seconds or minutes for a payment to arrive um could take half an hour so what if um what if um uh so I I have one service group and I'm paying $50 a month and now or like sorry it's a setup cost right.  
   
 

### 00:11:54 {#00:11:54}

   
**Wouter \- Powerhouse:** So, I'm um yeah, I'm paying I'm paying u $100 setup cost. And while the payment is on the way, I add another service group. And now my setup is supposed to be 500\. Um but the payment is underway. And then the operation arrives a little bit later and it says the setup is paid and it doesn't specify that it was no it was only the 100 or the 100 setup fee that that was paid. So so we definitely need um an amount to be specified together with the operation here.  
**Apeiron \- Powerhouse:** All right. Um I Yeah. Okay. Uh didn't Yeah. I was following some other uh Yeah. logic here, but no worries. Um will will I mean I  
**Wouter \- Powerhouse:** But what what's the once you have the amount um of course everything else  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** gets calculated based on that right? to the the change in the credit and the and the the debt and like all that.  
   
 

### 00:13:01 {#00:13:01}

   
**Wouter \- Powerhouse:** What would be very wrong is to let the user make all those calculations and take that as take these  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** these many the different values as input.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** So one value the amount that you're paying that's a I'm  
**Apeiron \- Powerhouse:** Yeah. Okay. Uh and Yeah.  
**Wouter \- Powerhouse:** I'm also wondering if it's um if it's even necessary to and I know I was probably the one that said like uh we should have two operations but now think about it I don't know if it's even necessary to have two different operations. Um, so I I think uh the pay setup cost and pay recurring um should probably not be two different things. It should just be report  
**Apeiron \- Powerhouse:** Okay. All right.  
**Wouter \- Powerhouse:** payment.  
**Apeiron \- Powerhouse:** Uh because now that you think now now that you said it for the orages, let me show you. So for the so here are the this is just like one metric that can be charged and first things first the the hard limit is 10 so if I write 12 it should be 10 okay it doesn't go above the absolute limit and here everything in the cycle was paid like let's say for example of course it was paid up front that that's how we are activating the subscriptions but then during the billing cycle the orange is applied like $15 are still to be paid.  
   
 

### 00:14:37 {#00:14:37}

   
**Apeiron \- Powerhouse:** So here, if I'm not mistaken, we have uh um uh where is it? Uh metric reset cycles. Yeah, I think we are like I what is going to be like this is not going to be you you cannot pay this right now. Basically, you cannot pay this right now. This is going to be bundled into the next billing cycle into the um I think the operation is like um report overage payment or something like that. But let let me show you. So maybe this is not the right way to but but basically you're acrewing usage of the metric during the during the billing cycle and the metric potentially could have a reset period that is 1 month instead of quarterly and I was thinking okay so should I then do the billing at the same cutoff as the reset is or should the billing just uh like should the dynamic cost just acrew during the the the billing cycle itself and I was I think it's more elegant to um to go with with the latter.  
   
 

### 00:15:57

   
**Apeiron \- Powerhouse:** So the metric is resetting. You're not being punished by using you know the overage but you can use it next month but you know that the bills are like stacking towards the end of the billing cycle and then you have to pay um everything. Maybe you want to do it differently. Um but yeah let me know.  
**Wouter \- Powerhouse:** No, it sounds right. I what I think we should think about is um like there are different types of metrics and um so seats are one type of metric like uh I mean seats and similar like that that's one that's one category um but like usage of resources  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** um is it behaves differently right so who um so  
**Apeiron \- Powerhouse:** Okay.  
**Wouter \- Powerhouse:** one is just a reset cycle um and so I think that the seats are they're a metric that doesn't reset right so it's like if uh even if we're at the end of the billing  
**Apeiron \- Powerhouse:** Yeah. And we have this.  
   
 

### 00:17:28

   
**Wouter \- Powerhouse:** cycle if you had four seats yesterday we we  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** crossed the line and you you still have four seats today.  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** Um so we're so the reset cycle actually indicates that other type of metric which is resource usage which means and and there it matters because how many invoices if I have five invoices a month in my um in my subscription then obviously at one once one month is is passed and I I had four invoices that I used I expected to drop back to zero Right. Um so I'm just wondering if if those are the only two two categories can um usage uh usage metrics can they never drop unless uh there is a reset.  
**Apeiron \- Powerhouse:** Okay. Yeah.  
**Wouter \- Powerhouse:** Um I so of course there will always  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** be um corrections. Uh so yeah it could be that we um yeah for some reason we you know we we've been saying that you've used an extra instance of something but actually turns out that the instance wasn't delivered or whatever like and and uh so you use three instead of four.  
   
 

### 00:18:59 {#00:18:59}

   
**Wouter \- Powerhouse:** So that's like um but I think in good accounting uh style it that should be that should just be corrected after the fact. So the usage is the usage that we're charging you by definition. Um if it doesn't reflect the real usage then it needs to be corrected. uh then we need to to just change that later. Like uh you know, if you've been paying for uh uh for four email inboxes, but you you only really had three because of a bug that we had, um then you should be paying for um you know, you should be charging minus one inboxes next uh next cycle. So,  
**Apeiron \- Powerhouse:** Yeah, but but just just to be sure. So if you have like five inboxes free per month and you've been using two, that's none of our problem. Yeah. That that that's just like you have up to five. Yeah.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** If you don't but a bug then appears at the orage if  
   
 

### 00:20:08

   
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** you somehow we are charging you for seven but you then prove that you've been using six or four or five but that's really an edge case I guess based on the fact that  
**Wouter \- Powerhouse:** Yeah. No,  
**Apeiron \- Powerhouse:** we are already it's not  
**Wouter \- Powerhouse:** no. Yeah. I mean, edge cases, but we we will need to account for that because um but what that means is probably that we should just have a um like a credit or a debt adjustment. And it's it's mostly going to be a credit adjustment, right? It's like we um yeah, we charge you too much for some reason. and uh now we're going to just reduce we're going to give you credits um to uh to compensate for that. So I I think that's the um the way to to think about that. So I so I would definitely um like provide an operation for that. Um so the point of the services the  
   
 

### 00:21:10 {#00:21:10}

   
**Apeiron \- Powerhouse:** Okay.  
**Wouter \- Powerhouse:** services is or the subscriptions rather is not really to track usage. It's to track what we're charging you for the usage. Um and that's the reason why it's not that important to go back and change historical metrics. Like if it turns out we've been charging you for five email addresses and you have only used four or like we're provided with only four, we're not going to go back and like change the five back into four because we want like accurate history like that. That's not what the subscription uh document model is about. It's about keeping track of um the usage in uh in function of uh of of of chart. So um yeah and but so let me so is that  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** the only two types of metrics that  
**Apeiron \- Powerhouse:** Well, currently we have I mean in the in the service offerings we  
**Wouter \- Powerhouse:** exist?  
**Apeiron \- Powerhouse:** have invoices and contributors uh as metrics.  
**Wouter \- Powerhouse:** Yeah.  
   
 

### 00:22:21

   
**Apeiron \- Powerhouse:** Um but and the  
**Wouter \- Powerhouse:** So an invoices is one that has a has a reset cycle of the  
**Apeiron \- Powerhouse:** contributors are not but currently in this specific case I don't have the contributors here  
**Wouter \- Powerhouse:** month.  
**Apeiron \- Powerhouse:** um to show um to show you because yeah um  
**Wouter \- Powerhouse:** Yeah, but you can just like uh have an infinite uh reset cycle. So they never reset. But that does mean we need to be able to correct uh the usage downward, right? because then next month you or like yeah, you may only be using uh like you may only be having four regular contributors now instead of five.  
**Apeiron \- Powerhouse:** Yeah. Um if per if one seat is already something that you're paying then yeah but if if  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** it's  
**Wouter \- Powerhouse:** So the so the real question is is it only like not having a reset cycle? Does that is that the reason why we need a manual correction? Like is that the same thing?  
   
 

### 00:23:25 {#00:23:25}

   
**Wouter \- Powerhouse:** Um if you do have a reset cycle and it automatically resets, uh does that mean you don't need a um so let's think about let's think of a resource that is like that actually can go down but it's cumulative, right? So like by definition it cannot go down like let's say um we're measuring CPU usage like that's a bad metric um because uh CPU usage goes up and down. So you should be tracking cumulative CPU hours and that's exactly what what happens right. Um so the one metric I think is cumulative and resets. The other is um uh is is noncumulative and it um and it stays and um so for cumulative metrics what happens if the metric is so you you're going to you're going to correct based on like oh we overcharge you you get credits. Um and we can still do a correction like saying that yeah or uh yeah um the the non-cumulative metrics naturally have to trend up and down and then they need to be charged based on the on the prora cost of it.  
   
 

### 00:25:23

   
**Wouter \- Powerhouse:** Um yeah. So, so an adjustment of the of the non-cumulative metrics is um is essentially the same as as a reset of the cumulative metric when the when the cumulative message metric resets like for example uh CPU hours usage um that's the point where you charge  
**Apeiron \- Powerhouse:** One more.  
**Wouter \- Powerhouse:** right so you you wipe the slate clean you say okay now you're we're adding um the uh we're adding the resource usage or overage that you um that you've used. We're adding it to your debt and uh we're resetting because now you paid for it. So we're resetting the metric to zero.  
**Apeiron \- Powerhouse:** But that would mean you pay you you pay like when you say charge you pay like if if  
**Wouter \- Powerhouse:** Um  
**Apeiron \- Powerhouse:** it resets on a weekly basis or like a monthly basis and the and the billing cycle is quarterly You're paying at the reset time. So it's added to that.  
**Wouter \- Powerhouse:** now you're not paying it is added to your  
**Apeiron \- Powerhouse:** Okay.  
   
 

### 00:26:33

   
**Apeiron \- Powerhouse:** Then that Yeah. Fine.  
**Wouter \- Powerhouse:** debt.  
**Apeiron \- Powerhouse:** Yeah. Sure. But that's for you were is describing the cumulative um cumulative metric. Yeah. The CPU usage.  
**Wouter \- Powerhouse:** Yeah. Yeah.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Yeah. So, uh that could be daily or even hourly, right? Um  
**Apeiron \- Powerhouse:** But storage use is just for example a non-cumul uh mean no storage is  
**Wouter \- Powerhouse:** yes.  
**Apeiron \- Powerhouse:** yeah it's a non-cumul meaning like it's a random yeah or is  
**Wouter \- Powerhouse:** Well, um it could be both because  
**Apeiron \- Powerhouse:** it  
**Wouter \- Powerhouse:** um so the the thing with the with the non-cumulative metrics is that they they still follow the billing cycle, right? And you get so essentially you get a reset at the end of the billing cycle. So now I'm wondering is the is the billing cycle the um is the billing cycle the the limit on the on the reset cycle and is a non-cumulative metric is just one that doesn't drop to zero when you hit the building cycle.  
   
 

### 00:27:51

   
**Wouter \- Powerhouse:** So let's let's let's think about this right. So let's say you're um yeah, I think that's like the most flexible way and and correct way of doing it is um so so I do think actually we should keep track of uh what is a cumulative and what is a non-cumulative metric and just always have a reset.  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** That would be easier, I think. Yeah. So,  
**Apeiron \- Powerhouse:** H.  
**Wouter \- Powerhouse:** for example, if you have um uh you're you're paying for like CPU uh hours per day, right? So, uh today you've used five CPU hours. Um, and so the reset is at the end of the day or like you know after 24  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** hours we're adding the cost of last day to your bill to your debt and um usage drops back to zero for that for the next day.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** So that's really the thing like the usage drops back to zero. Um,  
   
 

### 00:29:02 {#00:29:02}

   
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** let's say that uh for storage, yeah, storage is a bad it's confusing because it it actually can also be uh I'm not  
**Apeiron \- Powerhouse:** Almost  
**Wouter \- Powerhouse:** actually sure if Amazon, for example, charges you for gigabyte hours or something. But I guess the the the reason it doesn't really matter,  
**Apeiron \- Powerhouse:** there.  
**Wouter \- Powerhouse:** right? because it's not um uh even even for the uh even for the seats, it's still you're still paying per seat per month, right? Or per seat per quarter. The only thing is that usage doesn't reset.  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** So that's really the the difference.  
**Apeiron \- Powerhouse:** Yeah. Yeah.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** So that's I think that's the only difference is that like you have cumulative metrics that uh they drop back to zero and you're at the when it when the when  
**Apeiron \- Powerhouse:** Exactly.  
**Wouter \- Powerhouse:** um at the usage reset uh you um you pay for whatever accumulated and then it drops back to zero.  
   
 

### 00:30:16

   
**Wouter \- Powerhouse:** Um and the other metric is um yeah so the other metric  
**Apeiron \- Powerhouse:** non cumulative.  
**Wouter \- Powerhouse:** is just it it all like there is also a time when now you pay for it but it it just stays at the same level.  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** Um  
**Apeiron \- Powerhouse:** But do we have the the the capabilities in the service offering payload already? like you can't check it's a non cumul it's a non-reset it doesn't have a reset no reset cycle for example is an option for  
**Wouter \- Powerhouse:** Yeah. But so now I think now we should actually  
**Apeiron \- Powerhouse:** contribut  
**Wouter \- Powerhouse:** um it doesn't have a reset cycle. But like the fact that it because then we get in trouble with the billing cycle, right? Then it's like, yeah, what if uh what if I have a like I have seats and I so I think there's actually there is a um what would you call that? Like a settlement or not really? No, that's the opposite of settlement.  
   
 

### 00:31:26

   
**Wouter \- Powerhouse:** It's like pre you're not even charged. Yeah, you're um you're not even build yet. um you but we're just adding it to your debt. So that's like let me ask chat.  
**Apeiron \- Powerhouse:** You're not being charged yet, but we're adding it to your depth, but you're going to pay at the end of the billing cycle.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** This is how we are currently handling the dynamic cost if you like the overages. Yeah,  
**Wouter \- Powerhouse:** Yeah. So let me let me ask  
**Apeiron \- Powerhouse:** they're like a they're a projection. Um  
**Wouter \- Powerhouse:** probably going to say charge. It says that is usually called invoicing invoice generation. The step are accumulator is crystallized into monetary account amount added to the customer's outstanding balance and the usage counter resets. The actual payment collection that happens afterward is called charging collection or  
**Apeiron \- Powerhouse:** Yeah,  
**Wouter \- Powerhouse:** settlement.  
**Apeiron \- Powerhouse:** certainly have a settlement here with uh  
   
 

### 00:34:09

   
**Wouter \- Powerhouse:** Yeah. But so depending on the building platform and context you will also hear  
**Apeiron \- Powerhouse:** this  
**Wouter \- Powerhouse:** acral um building cycle close. Usage finalization.  
**Apeiron \- Powerhouse:** settlement. No.  
**Wouter \- Powerhouse:** No, no. Settlement is at the very end. Um, so metronome orbs building they call it usage finalization. The moment metered usage is logged in and converted to a line item. The billing cycle is when we send you the bill like it's in the word.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Um  
**Apeiron \- Powerhouse:** But currently you're paying for the orages at the building settlement cycle at the settlement of the billing cycle. That's when you when when you pay  
**Wouter \- Powerhouse:** Yeah. Yeah. Yeah. Um, so you're saying what you're saying is there's no but the death the debt isn't increased yet that uh when the the usage gets reset or like get get Yeah.  
**Apeiron \- Powerhouse:** No,  
**Wouter \- Powerhouse:** gets  
   
 

### 00:35:46

   
**Apeiron \- Powerhouse:** no, it's not because you can it can it can Yeah, it's a it's a projection. It's a projected amount. Uh it's it sits in the projected um amounts because it can vary based on your activity. Yeah.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** So you're  
**Wouter \- Powerhouse:** So it it says here the full life cycle is roughly metering finalization slashinvoicing the debt goes up usage goes to  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** zero and then billing slashcharging uh and then payment uh doesn't mention but like that's uh um No. Yeah. the reset cycle that what we call it is the is kind of the uh it it's it's the wrong term because it doesn't work for um for non-cumulative metrics but if we only had cumulative metrics I think reset cycle would be very clear the problem is if you look at seats  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** Um, it's it's not a reset cycle like the seats stay at five,  
**Apeiron \- Powerhouse:** Then I'm just going to change from no reset cycle to non-cumulative.  
   
 

### 00:37:09

   
**Wouter \- Powerhouse:** right?  
**Apeiron \- Powerhouse:** And that's it in the in the editor itself. And we can clear things  
**Wouter \- Powerhouse:** Yeah. Yeah. Yeah. Um,  
**Apeiron \- Powerhouse:** up.  
**Wouter \- Powerhouse:** but so um yeah, so the we should Yeah. usage finalization or invoicing. Invoicing to me sounds um sounds very conf like that's weird because it's not that you're sending them an invoice. It just means that you're adding a line item to the invoice draft and not even because um yeah uh usage finalization is a Let me see.  
**Apeiron \- Powerhouse:** there. I mean I don't want to jump uh from topic to topic but there is a third type of metric we could also think about if it if it makes sense. Uh Claude is telling me about a high watermark metric.  
**Wouter \- Powerhouse:** I got maximum usage  
**Apeiron \- Powerhouse:** Uh meaning yeah so this could be connected to our active  
**Wouter \- Powerhouse:** over.  
**Apeiron \- Powerhouse:** drives or connected to reactor in instances.  
   
 

### 00:38:44 {#00:38:44}

   
**Apeiron \- Powerhouse:** So it could we could think about that as also if you're built for  
**Wouter \- Powerhouse:** Yeah. But so even that like if you indeed think of like a metering period and then the metering  
**Apeiron \- Powerhouse:** by  
**Wouter \- Powerhouse:** period ends and at that point you um yeah so you add it to their to their debt. That's why they call it invoicing. It's like yeah it's it's added to your debt. That's um uh yeah why is there no word for that? like a cruel  
**Apeiron \- Powerhouse:** cruel, but it's  
**Wouter \- Powerhouse:** a cruel cycle. Maybe that's so that that focuses because there's two things happening, right? Like the the usage may be reset but not always.  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** and um but it is the moment that we're acrewing your debt. So I think acrual cycle is probably um the cleanest term because it always means that we're um yeah we're adding to your debt whatever you've used. So usage from the usage the metric point of view is a usage finalization from the from the debt point of view it's a cruel that happens at the same time.  
   
 

### 00:40:18 {#00:40:18}

   
**Wouter \- Powerhouse:** So it's um a cruel cycle I think is is maybe the best  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** term.  
**Apeiron \- Powerhouse:** And and currently the acrual cycle is uh overlapping with our billing cycle.  
**Wouter \- Powerhouse:** Yes.  
**Apeiron \- Powerhouse:** Right.  
**Wouter \- Powerhouse:** But um it will be much easier if you if you detach those.  
**Apeiron \- Powerhouse:** Wow.  
**Wouter \- Powerhouse:** Of course they should. Yeah. Yeah. Because because then you don't need to um so you don't  
**Apeiron \- Powerhouse:** Easier.  
**Wouter \- Powerhouse:** need to uh uh to keep track of um there's already the reset cycle, right?  
**Apeiron \- Powerhouse:** The rect cycle is there for the usage. Yeah.  
**Wouter \- Powerhouse:** Yeah. Yeah.  
**Apeiron \- Powerhouse:** Not for the  
**Wouter \- Powerhouse:** But but that's the thing like like if if at that moment you just also um  
**Apeiron \- Powerhouse:** pay just the crew to that.  
**Wouter \- Powerhouse:** acrew the debt no acrude the debt then um you you have one less thing to keep track of because  
**Apeiron \- Powerhouse:** Okay.  
   
 

### 00:41:19

   
**Wouter \- Powerhouse:** otherwise it's like yeah usage is reset but was the debt already paid? um while it's kind of in limbo and um and then if the billing cycle ends you need to go back and like go okay well the the uh yeah like usage was reset here so to probably make that like a point where we calculated that um so you then you need to go back like potentially multiple approval cycles and and that can be complicated to to calculate  
**Apeiron \- Powerhouse:** All right. So yeah,  
**Wouter \- Powerhouse:** So I um so I would so this this dynamic number there that you have this is  
**Apeiron \- Powerhouse:** I wanted to speak about that.  
**Wouter \- Powerhouse:** the this is the forecast of um  
**Apeiron \- Powerhouse:** This is the projection. Yeah. The forecast. Yeah. And when and and when uh and when this is going to be reset at the uh the  
**Wouter \- Powerhouse:** uh  
**Apeiron \- Powerhouse:** reset like monthly uh reset for example this dynamic number is going to be put here uh as a depth.  
   
 

### 00:42:21 {#00:42:21}

   
**Apeiron \- Powerhouse:** Yeah. like uh and then the dynamic is uh will not have any you didn't acrewue  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** any dynamic cost. Then like after the bit after the the reset is done  
**Wouter \- Powerhouse:** Yeah. So if so,  
**Apeiron \- Powerhouse:** you  
**Wouter \- Powerhouse:** yeah.  
**Apeiron \- Powerhouse:** are  
**Wouter \- Powerhouse:** So the the then the next issue is going to be that you're kind of losing the information on where did the debt come from? Uh was it fixed?  
**Apeiron \- Powerhouse:** exactly yeah but it's just a matter of one label one matter of  
**Wouter \- Powerhouse:** Was it dynamic? Was it was it the setup cost?  
**Apeiron \- Powerhouse:** one information icon or label or something like that but like a small line item below the below this. So, but  
**Wouter \- Powerhouse:** Yeah. And Yeah.  
**Apeiron \- Powerhouse:** yeah.  
**Wouter \- Powerhouse:** Yeah. So, so every time that you add to the debt  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** um and and here we have like the typical choice either we either we just rely on the operations to for the history um  
   
 

### 00:43:24

   
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** or I think in that case it's uh it's probably Well, let's let's think about it. Um, yeah. So, so what you can do is you every time you add to the debt,  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** you um indeed you label it like uh we're adding it to it because um we're charging for um for a setup fee or we're like uh we're  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** adding that because of a a prepayment of the of the billing  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** cycle or we're adding that because of  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** um uh the dynamic usage is uh is so the the cruel  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** cycle and um Okay.  
**Apeiron \- Powerhouse:** Yeah,  
**Wouter \- Powerhouse:** So yeah.  
**Apeiron \- Powerhouse:** depth is not a flat amount. Basically, it becomes this kind of structured uh amount that  
**Wouter \- Powerhouse:** Yeah. And then and then so those those um yeah indeed like line items that you're  
**Apeiron \- Powerhouse:** Yeah.  
   
 

### 00:44:37

   
**Wouter \- Powerhouse:** adding to to that.  
**Apeiron \- Powerhouse:** Uhhuh.  
**Wouter \- Powerhouse:** So if there was nothing else uh just keeping track of like you know where did it come from I would probably say just like you have an input parameter and your operation and then you just like you you go back a couple of operations and like you see um but the issue is you also want to keep track then for the next step which is a a bill was generated Um, so you want to keep track of every of every debt  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** slice whether it was already build or not. Yeah. So, so when you when the when the cruel cycle ends, we're adding a little slice to your debt. We label it.  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** Um, and because I said a cruel cycle, that's by definition the one that that adds up dynamic debt.  
**Apeiron \- Powerhouse:** Yeah. Mhm.  
**Wouter \- Powerhouse:** Right.  
**Apeiron \- Powerhouse:** Yep.  
**Wouter \- Powerhouse:** Um, when the billing cycle ends, we add a prepayment slice to your to your debt.  
   
 

### 00:45:52 {#00:45:52}

   
**Wouter \- Powerhouse:** Um, and when you either you change uh like yeah, you you uh you add a new service group or you activate the service for this for the first time. we add another another type of debt to your  
**Apeiron \- Powerhouse:** That's  
**Wouter \- Powerhouse:** um to your debt balance which is the uh yeah the the setup cost debt and so but  
**Apeiron \- Powerhouse:** and and just Yeah. Go  
**Wouter \- Powerhouse:** the um the reason why  
**Apeiron \- Powerhouse:** ahead.  
**Wouter \- Powerhouse:** I I didn't think it matters like is because I was thinking of the payment now when a payment comes in what What are you paying for? And let's say you you you know your debt is uh 1,000 and you're only paying 750\. What are you paying for? And but now you have a clear answer. It should be um that you you pay it's first in first out. So you you pay for the oldest slice of that first and that's it.  
**Apeiron \- Powerhouse:** Mhm. All right.  
   
 

### 00:47:09 {#00:47:09}

   
**Wouter \- Powerhouse:** So you so your the debt slices or like the deadline items uh they need um they need a label whether they are um  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** they were they have acred because of the it's a setup cost.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** It's a prepayment or it's um it's a dynamic uh  
**Apeiron \- Powerhouse:** Yeah. Yeah. Yeah. because more and more I mean you can imagine that people I mean services are going to have more metrics  
**Wouter \- Powerhouse:** payment.  
**Apeiron \- Powerhouse:** than just one or two. So just adding this into the flat depth is going to cause confusion but having everything neatly laid out in line items not only shows a good deal of transparency to the user but also when you're generating bills like when you're hooking the invoicing engine into this it it it  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** can already have things structured.  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** All right.  
**Wouter \- Powerhouse:** And so the the the only rule the only business rule when it comes  
   
 

### 00:48:01

   
**Apeiron \- Powerhouse:** Oh,  
**Wouter \- Powerhouse:** to so I think that like the the sort of acrruel cycle as we've now uh called it or  
**Apeiron \- Powerhouse:** yeah.  
**Wouter \- Powerhouse:** identified it um  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** or the bill the billing cycle rather should be a multiple of the acral cycle.  
**Apeiron \- Powerhouse:** What?  
**Wouter \- Powerhouse:** The multiple can be one. Um, but you could have  
**Apeiron \- Powerhouse:** Yeah. Five ac cycles one building cycle.  
**Wouter \- Powerhouse:** uh Yeah. So,  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** you don't want that the billing cycle ends in the middle of an acrruel cycle.  
**Apeiron \- Powerhouse:** I mean it could happen to be  
**Wouter \- Powerhouse:** Yeah. And I don't I don't know that.  
**Apeiron \- Powerhouse:** honest.  
**Wouter \- Powerhouse:** Yeah. It doesn't really cause any issues. I think what that means is Yeah.  
**Apeiron \- Powerhouse:** It just carries over.  
**Wouter \- Powerhouse:** Exactly. Exactly. it carries over. So you you're not you're not paying for that yet because you haven't the cruel cycle hasn't ended yet.  
   
 

### 00:49:05 {#00:49:05}

   
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Um yeah, so maybe we don't even need that  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** rule. Uh I was going to say if if they are multiples then you can essentially Yeah, I know it's it's probably better to just separate them. But then what is a billing cycle? A billing cycle is very simple. Um point one the the the pre the prepayment or the fixed costs are added  
**Apeiron \- Powerhouse:** Yep.  
**Wouter \- Powerhouse:** to the debt for the for the for the next period for the next billing cycle. and you get  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** build. All the all the depth slices or line items that that don't have the flag build yet get flagged as as now build. Yeah. So um so the first thing you do is you add the fixed cost and then the next thing you do  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** is you you now flag the um the dead slices that uh are not flagged as build yet.  
   
 

### 00:50:32

   
**Wouter \- Powerhouse:** You you now flag them as build and that's it.  
**Apeiron \- Powerhouse:** Yeah. And right now I settled one billing cycle here. And of course the setup cost is paid. So this is not now going into the next billing cycle. But you can see that the fixed or like the prepaid is now in the outstanding B like depth. uh plus the dynamic is uh now I mean this should not be here of course it should be like if if if this is like an acrual uh cycle end now we have the five invoices already here like but it it it will is going to be more structured of course you'll have a drop-down uh like uh like a expand and have the line items there but uh this is basically how Mhm.  
**Wouter \- Powerhouse:** Yeah. Mhm.  
**Apeiron \- Powerhouse:** Yep.  
**Wouter \- Powerhouse:** Yeah. Okay. And so at the end of the cruel cycle I need I need to go.  
**Apeiron \- Powerhouse:** Yeah.  
   
 

### 00:51:25

   
**Wouter \- Powerhouse:** So at the end of the cruel cycle um two things can with the metric  
**Apeiron \- Powerhouse:** Okay.  
**Wouter \- Powerhouse:** two things can happen. If it's a cumulative metric then it's going to be reset to zero. Um if it's Yeah. And if it's not a cumulative metric,  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** then it just stays where it is.  
**Apeiron \- Powerhouse:** Yeah. Yeah.  
**Wouter \- Powerhouse:** And um yeah the so what what we would have to do at a high watermark thing like we don't need it yet, but it would be very easy to add, right? Like that would just mean when the metric when the metric goes up and down throughout the building  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** cycle, um yeah, you're uh you just you're just keeping track of the the maximum value. Um, so then what happens when um what happens when we make a change midcycle? So,  
**Apeiron \- Powerhouse:** Do  
**Wouter \- Powerhouse:** let's say I'm being charged uh five seats.  
   
 

### 00:52:51

   
**Apeiron \- Powerhouse:** what?  
**Wouter \- Powerhouse:** I'm being uh charged every month. And uh let's say it's a I'm I'm paying quarterly but  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** um yeah  
**Apeiron \- Powerhouse:** I mean if the operator I mean this is one of the things that we talked about operator can  
**Wouter \- Powerhouse:** the dynamic um so overcharge  
**Apeiron \- Powerhouse:** like  
**Wouter \- Powerhouse:** doesn't so does the billing cycle only  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** apply to the um the fixed cost. Is it really like the the prepayment cycle?  
**Apeiron \- Powerhouse:** It's currently it's the prepayment cycle and it is uh it is the the point where every um all the acrruel usage that was um building up the depth is also paid.  
**Wouter \- Powerhouse:** Yeah. But so there you say.  
**Apeiron \- Powerhouse:** So it's the Yeah.  
**Wouter \- Powerhouse:** So now it's at the moment it's two things, right?  
**Apeiron \- Powerhouse:** Yeah. And now it's two things. Yeah.  
**Wouter \- Powerhouse:** Yeah. And um so the the issue with that is if you have a very long let's say you pay one year up front any  
   
 

### 00:54:11 {#00:54:11}

   
**Apeiron \- Powerhouse:** Oh  
**Wouter \- Powerhouse:** any dynamic usage any dynamic debt that you're building up  
**Apeiron \- Powerhouse:** yeah.  
**Wouter \- Powerhouse:** is going to sit there for a whole year.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** And um then comes the bill and now we're charging you for the next year. And uh yeah, that's going to be bad. And by the way, there's a very good example of that, which is utilities. Uh at least before like a digital meter existed. But um it at least here in Belgium like the the typical way to pay for utilities  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** is that um you pay uh an estimate fixed demand every month based on your on your projected usage and then at the end of the year they settle it but you pay on a monthly basis and that's  
**Apeiron \- Powerhouse:** Yeah. Yeah. Yeah. We have the same.  
**Wouter \- Powerhouse:** that's because you don't you don't you really don't want to the entire year until for to  
   
 

### 00:55:11 {#00:55:11}

   
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** charge for dynamic. Uh  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** yeah.  
**Apeiron \- Powerhouse:** Okay. Um something to think about I guess. Uh either we have this kind of average monthly payment for the for every metric that we are tracking. Uh or you could also set a billing cycle for the metric itself. for the matrix  
**Wouter \- Powerhouse:** So the the utilities example is actually the um that's an example where like the billing  
**Apeiron \- Powerhouse:** itself.  
**Wouter \- Powerhouse:** cycle and that's why you need a a forecast and and a settlement at the end. Um the billing cycle is shorter than the approval cycle. So um your electricity usage it decreases throughout the entire year but we're only guessing where it is like problems we can't really measure it. So we're just adding like you know token amounts to your debt and we're building it on a monthly basis.  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** So your billing cycle is monthly but what we're charging you is uh it's a different category.  
   
 

### 00:56:38

   
**Wouter \- Powerhouse:** So that's actually it's another that category which is um projected usage like or like guess guest usage right um and at the end then we have to we have to settle so we have to uh to yeah to to reconcile settle is not the right word recon reconcile is is the right word uh so we have to reconcile the real usage with uh assumed usage.  
**Apeiron \- Powerhouse:** Yeah, but these  
**Wouter \- Powerhouse:** That's very it's very interesting example to keep in mind because not because we need it uh and I I wouldn't  
**Apeiron \- Powerhouse:** things  
**Wouter \- Powerhouse:** necess like like it's the same like the the high watermark thing. It's like we don't want it in the document model yet, but we want to to include it in the analysis as an example that like it still adds up, right? Uh and I think that would be an extra debt type which is um yeah which is like uh like a fixed uh like usage like guest usage estimated usage um and then at the end you uh you have reconciliation.  
   
 

### 00:57:59 {#00:57:59}

   
**Wouter \- Powerhouse:** So that it introduces like two two new types of debt and credit which is um estimated usage and um and uh and and and reconciliation.  
**Apeiron \- Powerhouse:** But but just before you go,  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** these things has have to be then um tagged as such during the  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** payload creation,  
**Wouter \- Powerhouse:** Yeah.  
**Apeiron \- Powerhouse:** during the service offering creation. Like when you're doing the metric stuff as an operator, you must know which one of these metrics are such that they are  
**Wouter \- Powerhouse:** But is it is it is it because um I would argue that the um Oh yeah yeah yeah. So there is no place to put uh what uh the estimated usage.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** Uh yeah yeah that's right. Yeah. But but the the um so what yeah I  
**Apeiron \- Powerhouse:** All right.  
**Wouter \- Powerhouse:** mean you can know that you need it if your billing cycle is shorter than the acrruel cycle like that's um no yeah that's  
   
 

### 00:59:08 {#00:59:08}

   
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** still yeah so  
**Apeiron \- Powerhouse:** But maybe this can be a Yeah. Maybe system can also  
**Wouter \- Powerhouse:** so let's let's let's write like let's write that list of um  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** five the five types of debt that we've identified and we we don't need all five of them from day one. But so it's the the fixed upfront cost. Uh well,  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** let's start with the setup cost. It's a setup cost. It's a one-time setup cost. It's a fixed upfront cost.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** It's uh the dynamic overage cost. It is the yeah I don't know if forfeit is uh but the forfeitary cost no it's um like yeah let's call it estimated usage uh cost and then if you have estimated  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** usage that means at one point you'll have to to reconcile the difference so the  
**Apeiron \- Powerhouse:** Go ahead.  
**Wouter \- Powerhouse:** the reconciliation And uh if you could write an example paragraph of each of those because the thing is like it's very clear on our mind right now but in in a year like we won't know the difference anymore between  
   
 

### 01:00:35 {#01:00:35}

   
**Apeiron \- Powerhouse:** Yeah, that that's what that's why I want to do a at least for this stuff I want to do like a like a business ma business analysis master uh how you say like like a place where everything is there like right now all all the components all the all the stuff all the reasoning is there.  
**Wouter \- Powerhouse:** Yeah,  
**Apeiron \- Powerhouse:** So not sure where exactly to put this but  
**Wouter \- Powerhouse:** I need to I need to So, um yeah, but this is good progress. So,  
**Apeiron \- Powerhouse:** yeah  
**Wouter \- Powerhouse:** uh so I think I honestly think we're mostly there. like the the main thing to still figure out I think is um so what happens when an acrruel cycle is um like like ends prematurely like if um because uh you're changing plans or  
**Apeiron \- Powerhouse:** Okay.  
**Wouter \- Powerhouse:** like something like that and then the answer is it's calculated pro rata but we need to like spell out exactly um what gets calculated it and and uh what gets added to your debt and when and then so I think it just goes in the queue and um yeah and you uh you get build when you get build the billing cycle doesn't change because the acrruel cycle changes uh but it it is you do want to  
   
 

### 01:01:54 {#01:01:54}

   
**Apeiron \- Powerhouse:** No.  
**Wouter \- Powerhouse:** so I think rule is that the billing cycle also terminates the acrruel cycle.  
**Apeiron \- Powerhouse:** So there is no um going over  
**Wouter \- Powerhouse:** So the the ac cruel cycle can be ended in the middle of a billing cycle,  
**Apeiron \- Powerhouse:** it.  
**Wouter \- Powerhouse:** but then at the end of that billing cycle, it it it gets cut off again obviously, right? Like if you're like 40% down the month, you change the plan or whatever, like you you pay it or like your debt is accumulated at that point, the the acrruel cycle is cut, but at the end of that month,  
**Apeiron \- Powerhouse:** So no car.  
**Wouter \- Powerhouse:** you're going to pay the 60%.  
**Apeiron \- Powerhouse:** Ah yeah.  
**Wouter \- Powerhouse:** Right? It's it's not that you're like gonna do like uh you're not going to get charged because your  
**Apeiron \- Powerhouse:** Okay.  
**Wouter \- Powerhouse:** acral cycle is is still going. Uh and then 40% in the next month you um uh 100% acrual cycle acrew that's not so the billing cycle always terminates the cruel cycle in in that case. Uh we had the we had the the utilities example that I think is is  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** different.  
**Apeiron \- Powerhouse:** So nothing carries over basically the acrual is not carrying over the billing cycle. That that also makes sense because building cycle is this kind of like a hard limit hard stop for everything.  
**Wouter \- Powerhouse:** Yeah. Yeah.  
**Apeiron \- Powerhouse:** All right.  
**Wouter \- Powerhouse:** So I I think you don't want to carry anything over unless you really have to  
**Apeiron \- Powerhouse:** Mhm.  
**Wouter \- Powerhouse:** and really having to do like that's example of the of the utility bill.  
**Apeiron \- Powerhouse:** Yeah.  
**Wouter \- Powerhouse:** All right.  
**Apeiron \- Powerhouse:** Okay. Um yeah. Um talk to you next month,  
**Wouter \- Powerhouse:** Cool.  
**Apeiron \- Powerhouse:** next week. Uh yeah, this is super exciting. Literally, it is. So yeah, uh see you later.  
**Wouter \- Powerhouse:** See you later.  
   
 

### Transcription ended after 01:03:50

*This editable transcript was computer generated and might contain errors. People can also change the text after it was created.*