import type { MailCard } from "./types";

export const mailCards: MailCard[] = [
  // ─── CLASS SORT (10 cards) ────────────────────────────────────────────────

  {
    id: "MSA-001",
    title: "Handwritten Birthday Card",
    scenario:
      "A handwritten envelope addressed to a residential customer. The sender affixed a First-Class Forever stamp. The handwriting is neat and the address is complete and current.",
    class: "first_class",
    shape: "card",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "rookie",
    explanation:
      "A Forever stamp is a First-Class stamp. Handwritten personal mail bearing a First-Class stamp is First-Class Mail. Deliver to the mailbox.",
    tags: ["class_sort", "first_class", "rookie"],
  },

  {
    id: "MSA-002",
    title: "Grocery Store Weekly Flyer",
    scenario:
      "A large colorful advertising flyer from a grocery chain. The indicia in the upper-right corner reads 'PRESORTED STANDARD U.S. POSTAGE PAID - PERMIT #442.' The address is printed and deliverable.",
    class: "usps_marketing_mail",
    shape: "flyer",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "rookie",
    explanation:
      "'PRESORTED STANDARD' in the indicia is the old name for USPS Marketing Mail. This is a deliverable Marketing Mail piece, so put it in the box.",
    tags: ["class_sort", "usps_marketing_mail", "rookie"],
  },

  {
    id: "MSA-003",
    title: "TIME Magazine Subscription",
    scenario:
      "A weekly magazine with 'PERIODICALS' printed in the postage area. It is addressed to a current subscriber at a residential address on your route.",
    class: "periodicals",
    shape: "magazine",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "rookie",
    explanation:
      "The word 'PERIODICALS' in the postage area identifies this as the Periodicals mail class. Magazines and newspapers authorized as Periodicals carry this marking.",
    tags: ["class_sort", "periodicals", "rookie"],
  },

  {
    id: "MSA-004",
    title: "Priority Mail Flat-Rate Box",
    scenario:
      "A red-white-and-blue Priority Mail flat-rate box shipped by an online retailer. The label reads 'PRIORITY MAIL' and shows a USPS tracking barcode. The customer is home.",
    class: "priority_mail",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "rookie",
    explanation:
      "Priority Mail flat-rate boxes are clearly marked 'PRIORITY MAIL.' Deliver to the address or attempt and leave notice.",
    tags: ["class_sort", "priority_mail", "rookie"],
  },

  {
    id: "MSA-005",
    title: "Priority Mail Express Overnight Envelope",
    scenario:
      "A white Priority Mail Express envelope with an orange stripe. The label reads 'PRIORITY MAIL EXPRESS' with a scheduled delivery date of today.",
    class: "priority_mail_express",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "rookie",
    explanation:
      "Priority Mail Express is the fastest USPS service. The distinctive orange stripe and 'PRIORITY MAIL EXPRESS' text identify it. Deliver by the committed time.",
    tags: ["class_sort", "priority_mail_express", "rookie"],
  },

  {
    id: "MSA-006",
    title: "USPS Ground Advantage Small Box",
    scenario:
      "A small brown box with a USPS-generated shipping label. The class printed on the label reads 'USPS GROUND ADVANTAGE.' It has a tracking number.",
    class: "usps_ground_advantage",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "rookie",
    explanation:
      "USPS Ground Advantage (formerly Parcel Select Ground/First-Class Package) is identified by the 'USPS GROUND ADVANTAGE' label. It includes USPS tracking.",
    tags: ["class_sort", "usps_ground_advantage", "rookie"],
  },

  {
    id: "MSA-007",
    title: "Media Mail Textbook",
    scenario:
      "A padded mailer with 'MEDIA MAIL' printed in the indicia area. The contents are educational textbooks shipped from a used-book seller to a college student.",
    class: "package_services",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "rookie",
    explanation:
      "Media Mail is a subclass of Package Services used for educational materials such as books, DVDs, and CDs. Look for 'MEDIA MAIL' in the indicia.",
    tags: ["class_sort", "package_services", "media_mail", "rookie"],
  },

  {
    id: "MSA-008",
    title: "Bulk Business Solicitation Letter",
    scenario:
      "A letter-size envelope printed with a company logo. The indicia reads 'NONPROFIT ORG U.S. POSTAGE PAID - ECRWSS.' The address is pre-printed and deliverable.",
    class: "usps_marketing_mail",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "regular",
    explanation:
      "'NONPROFIT ORG' or 'PRESORTED STANDARD' with a permit number are both Marketing Mail indicators. ECRWSS is an enhanced carrier route presort notation for Marketing Mail.",
    tags: ["class_sort", "usps_marketing_mail", "nonprofit", "rookie"],
  },

  {
    id: "MSA-009",
    title: "Monthly Bank Statement",
    scenario:
      "A letter-size window envelope from a national bank. The indicia reads 'PRESORTED FIRST-CLASS MAIL U.S. POSTAGE PAID.' The customer is current at this address.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "rookie",
    explanation:
      "'PRESORTED FIRST-CLASS MAIL' identifies this as First-Class even though it's a bulk mailing. Financial statements and bills are almost always First-Class.",
    tags: ["class_sort", "first_class", "presorted", "rookie"],
  },

  {
    id: "MSA-010",
    title: "EDDM Political Campaign Flat",
    scenario:
      "An oversized flat (larger than letter, smaller than flat maximum size) from a local political campaign. The address area reads 'ECRWSS - RESIDENT.' The indicia shows 'U.S. POSTAGE PAID - EDDM - RETAIL.'",
    class: "usps_marketing_mail",
    shape: "flat",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "regular",
    explanation:
      "EDDM (Every Door Direct Mail) is a Marketing Mail product. 'EDDM - RETAIL' in the indicia is the indicator. Addressed to 'Resident' means every active delivery point on your route.",
    tags: ["class_sort", "usps_marketing_mail", "eddm", "rookie"],
  },

  // ─── UBBM / NOT UBBM (10 cards) ──────────────────────────────────────────

  {
    id: "MSA-011",
    title: "Grocery Flyer: Vacant Unit",
    scenario:
      "A Marketing Mail grocery flyer with no mailer endorsement. The destination unit has been vacant for six months; the last tenant left no forwarding address.",
    class: "usps_marketing_mail",
    shape: "flyer",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: true,
    correctBin: "ubbm",
    difficulty: "regular",
    explanation:
      "Unendorsed Marketing Mail for a vacant address is Undeliverable Bulk Business Mail (UBBM). With no mailer endorsement, the carrier has no instruction to return or forward it. Handle per your unit's UBBM procedure.",
    tags: ["ubbm", "usps_marketing_mail", "vacant"],
  },

  {
    id: "MSA-012",
    title: "Marketing Mail: Address Service Requested, Addressee Moved",
    scenario:
      "A Marketing Mail letter endorsed 'ADDRESS SERVICE REQUESTED.' The customer moved three months ago and has an active Change of Address on file.",
    class: "usps_marketing_mail",
    shape: "letter",
    mailerEndorsement: "address_service_requested",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "ASR (Address Service Requested) on Marketing Mail means: return the piece to the sender with the new address attached (or with a notation if no address is available). The mailer pays for this service. This piece is NOT UBBM; the endorsement activates a return/notification service.",
    tags: ["ubbm_not", "usps_marketing_mail", "address_service_requested"],
  },

  {
    id: "MSA-013",
    title: "First-Class Letter: Old Resident, No COA",
    scenario:
      "A First-Class letter addressed to 'John Vasquez' at a house where a new family moved in eight months ago. There is no Change of Address on file for Vasquez.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "return_to_sender",
    correctCarrierEndorsement: "ank",
    difficulty: "regular",
    explanation:
      "First-Class Mail is NEVER UBBM. With no COA on file and the addressee unknown at this address, endorse with ANK (Addressee Not Known) and return to sender.",
    mistakeWarnings: [
      "Putting a First-Class letter in UBBM is a critical mistake. First-Class Mail always receives forwarding or return service.",
    ],
    tags: ["ubbm_not", "first_class", "ank", "no_coa"],
  },

  {
    id: "MSA-014",
    title: "Periodical Magazine: Addressee Moved",
    scenario:
      "A Periodicals-class magazine addressed to a subscriber who moved six months ago. No forwarding order is on file.",
    class: "periodicals",
    shape: "magazine",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "Periodicals are NOT UBBM. When a Periodicals piece is undeliverable and not forwardable, it should be returned to the publisher (sender). Mark appropriately and return.",
    mistakeWarnings: [
      "Periodicals are never treated as UBBM, even when the addressee has moved.",
    ],
    tags: ["ubbm_not", "periodicals", "moved"],
  },

  {
    id: "MSA-015",
    title: "Marketing Mail 'Occupant': Confirmed Vacant Unit",
    scenario:
      "A bulk-rate advertising flat addressed to 'Occupant' at an apartment you know has been vacant for four months. No endorsement on the piece.",
    class: "usps_marketing_mail",
    shape: "flat",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: true,
    correctBin: "ubbm",
    difficulty: "regular",
    explanation:
      "Even 'Occupant' or 'Current Resident' Marketing Mail becomes UBBM when the unit is vacant. With no mailer endorsement, there is no return instruction. Treat as UBBM per local procedures.",
    tags: ["ubbm", "usps_marketing_mail", "occupant", "vacant"],
  },

  {
    id: "MSA-016",
    title: "Marketing Mail Catalog: Return Service Requested",
    scenario:
      "A thick retail catalog with a Marketing Mail indicia. Printed clearly below the indicia: 'RETURN SERVICE REQUESTED.' The addressee moved two months ago.",
    class: "usps_marketing_mail",
    shape: "catalog",
    mailerEndorsement: "return_service_requested",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "RSR (Return Service Requested) on Marketing Mail means return the piece to the sender. This is NOT UBBM. The mailer has specifically requested return service.",
    tags: ["ubbm_not", "usps_marketing_mail", "return_service_requested"],
  },

  {
    id: "MSA-017",
    title: "First-Class Postcard: Addressee Unknown",
    scenario:
      "A First-Class postcard addressed to 'Maria Chen' at a residential address. The current occupants have lived there for three years and have never heard of Maria Chen.",
    class: "first_class",
    shape: "card",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "return_to_sender",
    correctCarrierEndorsement: "ank",
    difficulty: "regular",
    explanation:
      "First-Class postcards are NEVER UBBM. Endorse ANK (Addressee Not Known) and return to sender. The sender will receive the returned card.",
    mistakeWarnings: [
      "First-Class Mail, including postcards, is never UBBM. It always gets return or forwarding service.",
    ],
    tags: ["ubbm_not", "first_class", "ank", "postcard"],
  },

  {
    id: "MSA-018",
    title: "Bulk Marketing Letter: ANK, No Endorsement",
    scenario:
      "A Marketing Mail bulk letter addressed to 'Robert Kim.' You've delivered to 1802 Birch St for two years and there has never been a Robert Kim here. No mailer endorsement.",
    class: "usps_marketing_mail",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: true,
    correctBin: "ubbm",
    difficulty: "regular",
    explanation:
      "Unendorsed Marketing Mail for an unknown addressee is UBBM. Without a mailer endorsement requesting forwarding, return, or address correction, the carrier has no return instruction.",
    tags: ["ubbm", "usps_marketing_mail", "ank"],
  },

  {
    id: "MSA-019",
    title: "Media Mail Parcel: No Such Number",
    scenario:
      "A Media Mail package addressed to '502 Walnut Lane.' There is no 502 on Walnut Lane; numbers skip from 498 to 504. The parcel has a return address.",
    class: "package_services",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "return_to_sender",
    correctCarrierEndorsement: "nsn",
    difficulty: "regular",
    explanation:
      "Package Services / Media Mail is NOT UBBM. Mark NSN (No Such Number) and return to sender. Never treat a parcel as UBBM simply because the address is bad.",
    mistakeWarnings: [
      "Package Services is never UBBM. A bad address means NSN endorsement and return to sender (if a return address exists).",
    ],
    tags: ["ubbm_not", "package_services", "nsn"],
  },

  {
    id: "MSA-020",
    title: "Marketing Mail ESR: Undeliverable",
    scenario:
      "A Marketing Mail piece with 'ELECTRONIC SERVICE REQUESTED' printed below the indicia. The addressee moved six months ago with no forwarding order on file.",
    class: "usps_marketing_mail",
    shape: "letter",
    mailerEndorsement: "electronic_service_requested",
    extraService: "none",
    isAccountable: false,
    isUBBM: true,
    correctBin: "ubbm",
    difficulty: "inspection",
    explanation:
      "ESR (Electronic Service Requested) means the mailer receives electronic notification only. The physical piece is NOT returned; it is treated as UBBM. The mailer's electronic data is updated instead.",
    tags: ["ubbm", "usps_marketing_mail", "electronic_service_requested"],
  },

  // ─── CARRIER ENDORSEMENT DRILL (10 cards) ─────────────────────────────────

  {
    id: "MSA-021",
    title: "Apartment Number Doesn't Exist",
    scenario:
      "A First-Class letter addressed to 'Apt 4B, 220 Fulton Ave.' The building at 220 Fulton only has Apartments 1A through 2D. There is no Apt 4B in this building.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "nsn",
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "NSN (No Such Number) is used when the street or building number, including apartment numbers, does not exist on your route. Mark NSN and return to sender.",
    tags: ["endorsement", "nsn"],
  },

  {
    id: "MSA-022",
    title: "Street Name Doesn't Exist in This City",
    scenario:
      "A Marketing Mail letter addressed to '45 Clearwater Blvd, Springdale.' You carry every route in Springdale. There is no Clearwater Blvd in this city.",
    class: "usps_marketing_mail",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: true,
    correctCarrierEndorsement: "nss",
    correctBin: "ubbm",
    difficulty: "regular",
    explanation:
      "NSS (No Such Street) is used when the entire street name does not exist. Because it's unendorsed Marketing Mail, the bin is UBBM, but the carrier endorsement to mark is NSS. Note: For First-Class Mail in the same scenario, you would return to sender.",
    tags: ["endorsement", "nss", "usps_marketing_mail"],
  },

  {
    id: "MSA-023",
    title: "Addressee Never Lived Here",
    scenario:
      "You have delivered to 118 Spruce Court for three years. The long-time resident there is the Hendersons. Today a First-Class letter arrives for 'David Park.' The Hendersons confirm they have never heard of David Park.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "ank",
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "ANK (Addressee Not Known) is used when the addressee is not known to reside at this delivery point and there is no record of them. Mark ANK and return First-Class Mail to sender.",
    tags: ["endorsement", "ank"],
  },

  {
    id: "MSA-024",
    title: "Letter With Only Name and City",
    scenario:
      "A handwritten First-Class letter with only 'Patricia Okonkwo, Baltimore, MD 21218' on the envelope. No street address. No P.O. Box.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "ia",
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "IA (Insufficient Address) is used when the address is incomplete or missing key elements needed for delivery, such as a street name or number. Return to sender with IA endorsement.",
    tags: ["endorsement", "ia"],
  },

  {
    id: "MSA-025",
    title: "No Mailbox, No Mail Slot",
    scenario:
      "A recently renovated house on your route. There is no mailbox at the street, no mail slot in the door, and no instructions from the post office about a cluster box. You cannot safely deliver the mail.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "nmr",
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "NMR (No Mail Receptacle) is used when there is no safe place to deliver mail at an address. Return or hold the mail and notify your supervisor so the customer can be contacted.",
    tags: ["endorsement", "nmr"],
  },

  {
    id: "MSA-026",
    title: "Customer Refuses the Letter",
    scenario:
      "You hand a First-Class letter to the addressee at the door. They look at it and hand it back: 'I don't want this. Take it back.' They refuse to accept the piece.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "ref",
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "REF (Refused) is used when the addressee refuses to accept a piece. Mark REF and return to sender. Customers have the right to refuse mail they have not opened.",
    tags: ["endorsement", "ref"],
  },

  {
    id: "MSA-027",
    title: "Notice Left Three Weeks Ago: Never Claimed",
    scenario:
      "You left a notice (PS Form 3849) for a Priority Mail package three weeks ago. The customer has not picked it up from the post office. The holding period has expired.",
    class: "priority_mail",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "unc",
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "UNC (Unclaimed) is used when a piece has been held but not picked up within the applicable holding period. After the holding period expires, return to sender with UNC endorsement.",
    tags: ["endorsement", "unc"],
  },

  {
    id: "MSA-028",
    title: "Apartment Confirmed Vacant",
    scenario:
      "Apartment 3C at 77 Harbor Blvd has been empty for three months. The property manager confirmed the unit is vacant and no one is accepting mail.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "vac",
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "VAC (Vacant) is used when the delivery unit is confirmed vacant. For First-Class Mail, mark VAC and return to sender. For unendorsed Marketing Mail in the same scenario, UBBM would apply.",
    tags: ["endorsement", "vac"],
  },

  {
    id: "MSA-029",
    title: "Long-Time Customer: Confirmed Deceased",
    scenario:
      "Mrs. Eleanor Watts at 9 Orchard Row passed away two months ago. Her family has moved out. You have confirmed through a family member that she is deceased and no one is at the address to receive her mail.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "dec",
    correctBin: "return_to_sender",
    difficulty: "inspection",
    explanation:
      "DEC (Deceased) is used only when you have confirmed the addressee is deceased AND there is no other party at the address to receive mail. Return to sender with DEC endorsement.",
    mistakeWarnings: [
      "DEC should only be used when you have personally confirmed the death and no other occupant can receive the mail. Do NOT mark DEC based on rumors or vague 'moved away' reports. When in doubt, ask your supervisor.",
    ],
    tags: ["endorsement", "dec", "warn_dec"],
  },

  {
    id: "MSA-030",
    title: "Illegible Handwriting",
    scenario:
      "A handwritten envelope with nearly illegible scrawl. You can make out 'Baltimore, MD' but the street name is impossible to read. You have spent two minutes trying to decipher it.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "ill",
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "ILL (Illegible) is used when you genuinely cannot read the address after a reasonable effort. Mark ILL and return to sender. If you are uncertain between ILL and IA, IA (Insufficient Address) also applies when the address cannot be resolved.",
    tags: ["endorsement", "ill"],
  },

  // ─── ACCOUNTABLE / SPECIAL SERVICE (10 cards) ────────────────────────────

  {
    id: "MSA-031",
    title: "Certified Letter: No One Home",
    scenario:
      "A First-Class letter with a green Certified Mail label and barcode. You ring the bell twice. No one answers. There is no safe place to leave it without a signature.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "certified",
    isAccountable: true,
    isUBBM: false,
    correctBin: "leave_notice",
    difficulty: "regular",
    explanation:
      "Certified Mail requires a signature. When no one is home, leave a PS Form 3849 notice in the mailbox and bring the piece back to the post office. Do NOT leave a Certified letter without obtaining a signature.",
    mistakeWarnings: [
      "Never place Certified Mail in UBBM. It is accountable mail and must be returned to the office if undeliverable.",
    ],
    tags: ["accountable", "certified"],
  },

  {
    id: "MSA-032",
    title: "Registered Mail International Package",
    scenario:
      "A Registered Mail parcel from Germany. The label shows 'REGISTERED' with a red R-label. You ring the bell and knock. No answer.",
    class: "first_class",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "registered",
    isAccountable: true,
    isUBBM: false,
    correctBin: "leave_notice",
    difficulty: "inspection",
    explanation:
      "Registered Mail is the highest-security accountable service USPS offers. It requires a signature and a chain-of-custody scan. Leave PS Form 3849 and return the piece to the accountable section at the post office.",
    mistakeWarnings: [
      "Registered Mail is never UBBM. It must be accounted for and returned to the post office if undeliverable.",
    ],
    tags: ["accountable", "registered"],
  },

  {
    id: "MSA-033",
    title: "COD Package: No One Home",
    scenario:
      "A package labeled 'COLLECT ON DELIVERY (COD).' The customer owes $47.00 before you can release the package. You ring twice. No one answers.",
    class: "usps_ground_advantage",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "cod",
    isAccountable: true,
    isUBBM: false,
    correctBin: "leave_notice",
    difficulty: "inspection",
    explanation:
      "COD (Collect on Delivery) requires you to collect payment before releasing the package. If no one is home, leave PS Form 3849 and return the piece to the office. You cannot leave a COD without collecting money.",
    mistakeWarnings: [
      "COD is accountable mail. Never discard or treat as UBBM. The money collection is part of the service.",
    ],
    tags: ["accountable", "cod"],
  },

  {
    id: "MSA-034",
    title: "Insured Parcel Over $500: Signature Required",
    scenario:
      "A USPS Ground Advantage parcel with 'INSURED' sticker and a declared value of $650. It requires a signature on delivery. The customer is not home.",
    class: "usps_ground_advantage",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "insured_signature",
    isAccountable: true,
    isUBBM: false,
    correctBin: "leave_notice",
    difficulty: "regular",
    explanation:
      "Parcels insured for over $500 require a signature. When the customer isn't home, leave PS Form 3849 so they can pick it up at the post office or schedule a redelivery.",
    tags: ["accountable", "insured_signature"],
  },

  {
    id: "MSA-035",
    title: "Signature Confirmation Package",
    scenario:
      "An online order shipped via USPS Ground Advantage with a Signature Confirmation barcode. The sticker says 'SIGNATURE REQUIRED.' You ring the doorbell. No answer. A neighbor offers to sign.",
    class: "usps_ground_advantage",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "signature_confirmation",
    isAccountable: true,
    isUBBM: false,
    correctBin: "leave_notice",
    difficulty: "regular",
    explanation:
      "Signature Confirmation requires the addressee's (or authorized agent's) signature, not just any neighbor. Unless the addressee has authorized agent delivery, leave PS Form 3849 and return the package.",
    mistakeWarnings: [
      "Do not accept a signature from a neighbor for Signature Confirmation unless you have a Release Authorization signed by the addressee on file.",
    ],
    tags: ["accountable", "signature_confirmation"],
  },

  {
    id: "MSA-036",
    title: "Return Receipt: Delivering at the Door",
    scenario:
      "A Certified Mail letter with a green Return Receipt card attached. The customer answers the door. You need them to sign the green card.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "return_receipt",
    isAccountable: true,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "regular",
    explanation:
      "Return Receipt means the customer signs a green card (or electronic version) which is sent back to the mailer as proof of delivery. The addressee signs, you deliver the letter and take the signed card back to the office.",
    tags: ["accountable", "return_receipt"],
  },

  {
    id: "MSA-037",
    title: "Arrow Key Official Mail",
    scenario:
      "An envelope requiring an arrow key (a USPS master key). The envelope is labeled 'OFFICIAL MAIL - RETURN TO POSTMASTER' with a barcode. It cannot be delivered by standard carrier.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "arrow_key",
    isAccountable: true,
    isUBBM: false,
    correctBin: "accountable_clerk",
    difficulty: "inspection",
    explanation:
      "Arrow Key mail and certain official USPS mail must go to the accountable clerk or supervisor at the post office. Do not attempt to deliver this yourself. Return it to the accountable section.",
    tags: ["accountable", "arrow_key"],
  },

  {
    id: "MSA-038",
    title: "Postage Due Letter",
    scenario:
      "A letter with a 'POSTAGE DUE' stamp on it. The amount owed is $0.24. You ring the bell. No one answers.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "postage_due",
    isAccountable: false,
    isUBBM: false,
    correctBin: "leave_notice",
    difficulty: "regular",
    explanation:
      "Postage Due pieces require collection of unpaid postage before delivery. If the customer isn't home, leave a PS Form 3849 notice. Bring the piece back to the office.",
    tags: ["accountable", "postage_due"],
  },

  {
    id: "MSA-039",
    title: "Customs Due on International Parcel",
    scenario:
      "An international package from Mexico. A Customs Due label shows $14.75 in duties owed. The customer needs to pay before you release the package.",
    class: "first_class",
    shape: "parcel",
    mailerEndorsement: "none",
    extraService: "customs_due",
    isAccountable: true,
    isUBBM: false,
    correctBin: "leave_notice",
    difficulty: "inspection",
    explanation:
      "Customs Due requires collection before delivery, similar to COD. Leave PS Form 3849 if no one is home. The package goes back to the post office for customer pickup.",
    tags: ["accountable", "customs_due"],
  },

  {
    id: "MSA-040",
    title: "Certified Letter: Addressee Unknown",
    scenario:
      "A Certified Mail letter for 'Timothy Osei' at 303 Cedar Blvd. The current resident has lived there for five years and doesn't know anyone by that name.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "certified",
    isAccountable: true,
    isUBBM: false,
    correctCarrierEndorsement: "ank",
    correctBin: "return_to_sender",
    difficulty: "inspection",
    explanation:
      "Certified Mail for an unknown addressee must be returned to sender. It cannot be UBBM. Mark ANK (Addressee Not Known) and process through normal accountable return procedures. Never discard accountable mail.",
    mistakeWarnings: [
      "Certified Mail is NEVER UBBM regardless of the reason for non-delivery. Return through accountable procedures.",
    ],
    tags: ["accountable", "certified", "ank", "ubbm_not"],
  },

  // ─── MIXED / ADVANCED (5 cards) ───────────────────────────────────────────

  {
    id: "MSA-041",
    title: "Marketing Mail: Change Service Requested, Moved Customer",
    scenario:
      "A Marketing Mail letter with 'CHANGE SERVICE REQUESTED' printed below the indicia. The customer moved two months ago and has a forwarding order on file.",
    class: "usps_marketing_mail",
    shape: "letter",
    mailerEndorsement: "change_service_requested",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "return_to_sender",
    difficulty: "inspection",
    explanation:
      "CSR (Change Service Requested) means the piece is returned to sender with the new address information attached. The mailer updates their records. This is NOT UBBM; the endorsement activates address correction service.",
    tags: ["ubbm_not", "usps_marketing_mail", "change_service_requested"],
  },

  {
    id: "MSA-042",
    title: "Marketing Mail FSR: No Forwarding Order",
    scenario:
      "A Marketing Mail piece endorsed 'FORWARDING SERVICE REQUESTED.' The addressee moved eight months ago. There is no active forwarding order on file.",
    class: "usps_marketing_mail",
    shape: "letter",
    mailerEndorsement: "forwarding_service_requested",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "return_to_sender",
    difficulty: "inspection",
    explanation:
      "FSR (Forwarding Service Requested) on Marketing Mail: forward if a forwarding order exists; otherwise return to sender. With no active COA, return to sender. This is NOT UBBM; the endorsement always generates a return or forward, never disposal.",
    tags: ["ubbm_not", "usps_marketing_mail", "forwarding_service_requested"],
  },

  {
    id: "MSA-043",
    title: "First-Class Utility Bill: Straightforward Delivery",
    scenario:
      "A First-Class window envelope from the electric company. 'PRESORTED FIRST-CLASS MAIL' is in the indicia. The customer is current at this address.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "deliver",
    difficulty: "rookie",
    explanation:
      "A standard First-Class bill or statement for a current, deliverable address: deliver it. First-Class Mail is never UBBM under any circumstances.",
    mistakeWarnings: [
      "First-Class Mail, including bills and financial statements, is NEVER UBBM. Always deliver, forward, or return.",
    ],
    tags: ["first_class", "ubbm_not", "rookie"],
  },

  {
    id: "MSA-044",
    title: "Priority Mail Express: Addressee on Vacation",
    scenario:
      "A Priority Mail Express overnight envelope. The neighbor says the customer is on vacation for two weeks. There is no Hold Mail request on file.",
    class: "priority_mail_express",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "none",
    isAccountable: false,
    isUBBM: false,
    correctBin: "leave_notice",
    difficulty: "regular",
    explanation:
      "Priority Mail Express has a committed delivery time and should be attempted. Without a Hold Mail request, leave PS Form 3849 at the address and hold at the post office. PME is never UBBM.",
    tags: ["priority_mail_express", "ubbm_not"],
  },

  {
    id: "MSA-045",
    title: "Postage Due: Customer Refuses to Pay",
    scenario:
      "You have a Postage Due letter for $0.55. The customer answers the door, sees the charge, and says 'I'm not paying that, take it back.' They refuse to pay and refuse the piece.",
    class: "first_class",
    shape: "letter",
    mailerEndorsement: "none",
    extraService: "postage_due",
    isAccountable: false,
    isUBBM: false,
    correctCarrierEndorsement: "ref",
    correctBin: "return_to_sender",
    difficulty: "regular",
    explanation:
      "If a customer refuses a Postage Due piece, mark REF (Refused) and return it to sender. You cannot force the customer to pay or accept mail. Do not discard it.",
    tags: ["postage_due", "ref"],
  },
];
