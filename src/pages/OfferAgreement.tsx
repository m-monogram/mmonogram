import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const OfferAgreement = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen luxury-bg text-foreground">
      <SEOHead
        title="Offer Agreement — M-Monogram"
        description="Public offer agreement covering M-Monogram bespoke vehicle commissions and services."
        path="/offer-agreement"
      />
      {/* Back Button - positioned below logo */}
      <div className="absolute left-4 sm:left-6 md:left-12 z-20" style={{ top: `calc(env(safe-area-inset-top, 0px) + 6rem)` }}>
        <Link 
          to="/" 
          className="flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer touch-target border border-white/20 hover:border-white/40 px-4 py-2.5 sm:px-5 sm:py-3 bg-premium-black/50 backdrop-blur-md rounded-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <main className="pt-64 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="prose prose-invert max-w-none">
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-widest mb-8 text-foreground">
              OFFER FOR THE AGREEMENT OF VEHICLE MAINTENANCE AND REPAIR SERVICES
            </h1>

            <p className="text-muted-foreground mb-8">
              XX COMPANY LLC, License No: ____________, located at the address: XXXX, represented by Mr. XXXXXX, Manager (hereinafter referred to as the CAR SERVICE), publishes this Public Offer Agreement for providing services (hereinafter referred to as the Agreement) according to the List of Services that is an integral part of this Agreement.
            </p>

            <h2 className="text-2xl font-display uppercase tracking-widest mt-12 mb-6 text-foreground">PREAMBLE</h2>
            <p className="text-muted-foreground mb-4">
              This Agreement is created according to the Article 131 of the UAE Civil Code that states: "a contract will be formed if there is:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>(i) an offer,</li>
              <li>(ii) an acceptance of the offer and</li>
              <li>(iii) any special conditions provided in the law (which may relate to the subject matter of the contract) are met.</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              In case of acceptance of the stated terms and conditions, the individual or legal entity (hereinafter referred to as the CUSTOMER) accepts the offer, pays for the Services of the CAR SERVICE in accordance with the terms of this Agreement. Payment for Services by the Customer is an acceptance of the offer, which is considered equivalent to concluding an Agreement on the terms set out in the offer.
            </p>
            <p className="text-muted-foreground mb-4">
              Based on the above, please read the text of the public offer, and if you do not agree with any clause of the offer, do not pay and do not use the Services provided by the CAR SERVICE, inform the CAR SERVICE and settle terms and conditions through negotiations.
            </p>
            <p className="text-muted-foreground mb-8">
              By accessing the website (or mobile application) www.metagarage.ae or placing an order, the CUSTOMER irrevocably agrees to the{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>,{" "}
              Disclaimer, and Terms of Use of the platform.
            </p>

            <h2 className="text-2xl font-display uppercase tracking-widest mt-12 mb-6 text-foreground">1. SUBJECT</h2>
            <p className="text-muted-foreground mb-4">
              <strong>1.1.</strong> The CAR SERVICE undertakes to provide the services listed in clause 1.2. of this offer (hereinafter referred to as Services) on the CUSTOMER's assignment and request, and the CUSTOMER undertakes to accept and pay for the Services rendered to the CAR SERVICE.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>1.2.</strong> Within the framework of this offer, the CAR SERVICE provides the following types of services:
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>1.2.1.</strong> providing the CUSTOMER with comprehensive information support on the need for maintenance and/or repair of the CUSTOMER's car, the approximate cost of work and parts, as well as on the selection of a suitable car service organization for its implementation;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>1.2.2.</strong> delivery of the car to the site of the car service and back to the place of acceptance of the car by the CUSTOMER agreed by the Parties;
            </p>
            <p className="text-muted-foreground mb-4 pl-4">
              <strong>1.2.3.</strong> intermediary services: upon the CUSTOMER's order and at his expense, but on behalf of the CAR SERVICE, to provide of the third parties' services, including car diagnostics, further maintenance and repair of the car.
            </p>
            <p className="text-muted-foreground mb-8">
              <strong>1.3.</strong> The CUSTOMER is considered to have accepted (accepted) the terms of this offer in full, without any reservations and exceptions from the moment of executing the payment.
            </p>

            <h2 className="text-2xl font-display uppercase tracking-widest mt-12 mb-6 text-foreground">2. COST OF SERVICES AND PAYMENT PROCEDURE</h2>
            <p className="text-muted-foreground mb-4">
              <strong>2.1.</strong> All prices on the Website (or mobile application) www.metagarage.ae of the CAR SERVICE and in other online resources of the CAR SERVICE are indicated in UAE dirhams (AED) and are approximate. The final price can be changed after inspecting a car, identifying the necessary work and services.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>2.2.</strong> All prices include of 5% VAT.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>2.3.</strong> The payment of the services can be executed through online services by acceptable methods of payment or in the CAR SERVICE through card machine cashless.
            </p>
            <p className="text-muted-foreground mb-8">
              <strong>2.4.</strong> Advance payment of 10% to 100% is required depending on the kind of service and spare parts necessary to perform the work.
            </p>

            <h2 className="text-2xl font-display uppercase tracking-widest mt-12 mb-6 text-foreground">3. RIGHTS AND OBLIGATIONS OF THE PARTIES</h2>
            
            <h3 className="text-xl font-display uppercase tracking-widest mt-8 mb-4 text-foreground">3.1. The CAR SERVICE undertakes:</h3>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.1.1.</strong> to provide the CUSTOMER the Services agreed by the Parties efficiently and in a reasonable time;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.1.2.</strong> immediately inform the CUSTOMER about any information related to the provision of the Services;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.1.3.</strong> guarantee the CUSTOMER the quality of the Services provided; however, the CAR SERVICE is not responsible for the spare parts provided by the CUSTOMER and in this case does not give any guarantee for the spare parts, but gives the guarantee for work (services). The warranty is determined individually for each type of service and a car.
            </p>
            <p className="text-muted-foreground mb-4 pl-4">
              <strong>3.1.4.</strong> to ensure the safety of the CUSTOMER's car, the documents and spare parts handed over to the CAR SERVICE.
            </p>

            <h3 className="text-xl font-display uppercase tracking-widest mt-8 mb-4 text-foreground">3.2. The CUSTOMER assumes the following obligations:</h3>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.2.1.</strong> transfer to the CAR SERVICE for the duration of the provision of Services a vehicle, documents, spare parts and materials necessary for the execution of orders within the framework of the provision of services;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.2.2.</strong> provide the CAR SERVICE with all the necessary and/or requested information, that is necessary for the fulfillment of the CAR SERVICE's obligations;
            </p>
            <p className="text-muted-foreground mb-4 pl-4">
              <strong>3.2.3.</strong> pay for the Services rendered and the remuneration due, as well as other expenses of the CAR SERVICE on the terms and in the manner specified by this offer.
            </p>

            <h3 className="text-xl font-display uppercase tracking-widest mt-8 mb-4 text-foreground">3.3. The CAR SERVICE has the right to:</h3>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.1.</strong> request from the CUSTOMER additional information necessary for the provision of Services;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.2.</strong> in case of violation by the CUSTOMER of its obligations, suspend or terminate the provision of Services;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.3.</strong> suspend or terminate the provision of Services, in cases of identifying (discovering) new circumstances that were not previously specified by the CUSTOMER and which significantly affect the possibility of providing Services;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.4.</strong> unilaterally amend the Agreement and/or the List of services, prices by publishing them on the Website, mobile application www.metagarage.ae, or any other resources allowed by the laws of UAE, such changes come into force from the moment they are published;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.5.</strong> send newsletters at own expense to the CUSTOMER;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.6.</strong> refuse to perform the services in the absence of the CUSTOMER's acceptance of the order;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.7.</strong> refuse to perform the services in case it is found impossible to continue the work due to the absence or breakdown of the necessary equipment in the CAR SERVICE;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.8.</strong> refuse to perform the services due to the unwillingness or disagreement of the CUSTOMER with the performance of additional work and, accordingly, with the increase of the cost of work revealed during the execution of work, if the failure of these works prevents the performance of previously ordered services by the CUSTOMER;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.9.</strong> refuse to provide services to the CUSTOMER in case of inappropriate (rude), abusive behavior towards car service employees, in case of violation of payment terms and/or debt to the CAR SERVICE;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>3.3.10.</strong> to hold the CUSTOMER's car until the payment terms are fulfilled in the amount of the cost specified in the order;
            </p>
            <p className="text-muted-foreground mb-8 pl-4">
              <strong>3.3.11.</strong> to communicate with the CUSTOMER by any available means of communication be it verbally over the phone or face to face, in writing over Email, SMS, social media, WhatsApp or any other messengers.
            </p>

            <h2 className="text-2xl font-display uppercase tracking-widest mt-12 mb-6 text-foreground">4. WARRANTY OBLIGATIONS</h2>
            <p className="text-muted-foreground mb-4">
              <strong>4.1.</strong> The CAR SERVICE provides a guarantee for the work performed. The warranty period and the procedure for its application depend on the nature of the work and on the operating conditions of the car by the CUSTOMER. The following guarantees are provided by the CAR SERVICE:
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.1.</strong> For car repair work (repair of the chassis, cooling system, engine, braking system, suspension, ventilation and heating) – the warranty period is not more than 1 week from the date of completion;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.2.</strong> For control and diagnostic work – the warranty period is not more than 1 week from the moment of completion;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.3.</strong> For the repair of the automatic transmission (hereinafter automatic transmission) – the warranty period is not more than 1 month or 1 thousand km from the moment of completion, depending on what comes first. The warranty is not provided if spare parts provided by the CUSTOMER;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.4.</strong> For tin-painting works – the warranty period is not more than 3 months from the date of completion, with the exception of painting and repair works of plastic parts (bumper, moldings, linings, etc.), the warranty period for which is not more than 1 month from the date of their completion;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.5.</strong> For work on the repair of electrical equipment of the car – the warranty period is not more than 1 week from the date of their completion;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.6.</strong> For the installation of electrical equipment of the car (installation of parking sensors, radar detectors, video recorders, navigators, acoustic systems (tape recorders and other multimedia devices) – the warranty period is not more than 1 week from the date of completion;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.7.</strong> For work on the repair of alarm control panels – the warranty period is not more than 1 week from the date of their completion;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.8.</strong> The warranty does not apply to the work on mechanical polishing of block headlights and car body elements;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.9.</strong> For repair of internal combustion engine control sensors, automatic transmission, systems: ABS and SRS – warranty does not apply;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.10.</strong> The warranty does not apply to the replacement of lamps for external lighting of the car (incandescent, halogen, xenon, bi-xenon, LED);
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.11.</strong> For work on refueling the air conditioner – the warranty period is no more than 2 weeks from the moment of their completion.
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.1.12.</strong> The warranty for changing the color by gluing vinyl film is starting from 3 months.
            </p>
            <p className="text-muted-foreground mb-4 pl-4">
              <strong>4.1.13.</strong> The warranty for installation of electrical equipment (upgrade) is from 3 months, the warranty doesn't apply for spare parts, only maintenance services.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>4.2.</strong> The warranty period is valid only in cases when the following conditions are met by the CUSTOMER:
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.2.1.</strong> The CUSTOMER provided to the CAR SERVICE an order the work on which was carried out by the CAR SERVICE;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.2.2.</strong> The CUSTOMER operated his car without violating the Rules of its operation, except in cases where it did not affect the services provided by the CAR SERVICE;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.2.3.</strong> The CUSTOMER purchased spare parts used during repair at the CAR SERVICE, except in cases when the CUSTOMER provided to the CAR SERVICE his spare parts, but the expert company proved that this did not affect the work carried out by the CAR SERVICE;
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.2.4.</strong> During the warranty period, the CUSTOMER has not been involved in road traffic accidents (hereinafter referred to as accidents);
            </p>
            <p className="text-muted-foreground mb-2 pl-4">
              <strong>4.2.5.</strong> During the warranty period, the CUSTOMER did not contact another car repair service or did not try to "eliminate" the identified problem of repairing the car on his own;
            </p>
            <p className="text-muted-foreground mb-8 pl-4">
              <strong>4.2.6.</strong> The CUSTOMER informed and visited the CAR SERVICE immediately (within a week from the moment of detection), as soon as there were signs or doubts about the quality of the service provided.
            </p>

            <h2 className="text-2xl font-display uppercase tracking-widest mt-12 mb-6 text-foreground">5. RESPONSIBILITY OF THE PARTIES</h2>
            <p className="text-muted-foreground mb-4">
              <strong>5.1.</strong> The Parties will try to resolve all disputes through negotiations. If they will not reach an agreement and will not find the solution, all disputes are subject to UAE courts.
            </p>
            <p className="text-muted-foreground mb-8">
              <strong>5.2.</strong> The CAR SERVICE has the right to transfer the performance of services ordered by the CUSTOMER to third parties.
            </p>

            <h2 className="text-2xl font-display uppercase tracking-widest mt-12 mb-6 text-foreground">6. TERM OF THE AGREEMENT</h2>
            <p className="text-muted-foreground mb-4">
              <strong>6.1.</strong> The Agreement comes into force from the moment of its Acceptance (signing of the order or payment for services) and is valid until the Parties fully fulfill their obligations.
            </p>
            <p className="text-muted-foreground mb-8">
              <strong>6.2.</strong> Termination of the Agreement does not release the Parties from fulfilling the obligations not fulfilled under the Agreement.
            </p>

            <h2 className="text-2xl font-display uppercase tracking-widest mt-12 mb-6 text-foreground">7. LEGAL ADDRESS AND DETAILS OF THE CAR SERVICE</h2>
            <p className="text-muted-foreground mb-2">XXXX COMPANY XXX</p>
            <p className="text-muted-foreground mb-2">ADDRESS XXX</p>
            <p className="text-muted-foreground mb-2">
              Email: <a href="mailto:m_monogram@mail.ru" className="text-primary hover:underline">m_monogram@mail.ru</a>
            </p>
            <p className="text-muted-foreground">
              Phone number: <a href="tel:+971547923309" className="text-primary hover:underline">+971 54 792 33 09</a>
            </p>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OfferAgreement;
