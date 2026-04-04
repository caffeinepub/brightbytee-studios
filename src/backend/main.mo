import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";


actor {
  type PaymentRecord = {
    templateId : Nat;
    transactionRef : Text;
    caller : Principal;
    buyerName : Text;
    buyerEmail : Text;
    buyerAddress : Text;
    businessDetails : Text;
    accountRecoveryConfirm : Bool;
    templateUseCase : Text;
    createdAt : Int;
  };

  type Announcement = {
    id : Nat;
    title : Text;
    content : Text;
    createdAt : Int;
    isPublished : Bool;
  };

  type Template = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    isFree : Bool;
    previewImageBlobId : Text;
    templateFileBlobId : Text;
    features : [Text];
    createdAt : Int;
  };

  type Review = {
    id : Nat;
    templateId : Nat;
    reviewerName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  type PolicyDocument = {
    id : Nat;
    docType : Text;
    fileName : Text;
    blobId : Text;
    uploadedAt : Int;
  };

  type BlockedBuyer = {
    id : Nat;
    email : Text;
    reason : Text;
    blockedAt : Int;
  };

  module Template {
    public func compare(a : Template, b : Template) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  include MixinStorage();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let templates = Map.empty<Nat, Template>();
  let announcements = Map.empty<Nat, Announcement>();
  let paymentRecords = List.empty<PaymentRecord>();
  let reviews = Map.empty<Nat, Review>();
  let policyDocuments = Map.empty<Nat, PolicyDocument>();
  let blockedBuyers = Map.empty<Nat, BlockedBuyer>();

  var nextId = 0;

  func getNextId() : Nat {
    let id = nextId;
    nextId += 1;
    id;
  };

  func getTemplateInternal(id : Nat) : Template {
    switch (templates.get(id)) {
      case (?template) { template };
      case (null) { Runtime.trap("Template not found") };
    };
  };

  func getAnnouncementById(id : Nat) : Announcement {
    switch (announcements.get(id)) {
      case (?announcement) { announcement };
      case (null) { Runtime.trap("Announcement not found") };
    };
  };

  func getDocById(id : Nat) : PolicyDocument {
    switch (policyDocuments.get(id)) {
      case (?doc) { doc };
      case (null) { Runtime.trap("Policy document not found") };
    };
  };

  public query ({ caller }) func getTemplates() : async [Template] {
    templates.values().toArray().filter(func(t) { not t.isFree }).sort();
  };

  public query ({ caller }) func getFreeTemplates() : async [Template] {
    templates.values().toArray().filter(func(t) { t.isFree }).sort();
  };

  public query ({ caller }) func getAnnouncements() : async [Announcement] {
    announcements.values().toArray().filter(func(a) { a.isPublished });
  };

  public shared ({ caller }) func addTemplate(name : Text, description : Text, price : Nat, isFree : Bool, previewImageBlobId : Text, templateFileBlobId : Text, features : [Text]) : async Nat {
    let id = getNextId();
    let template : Template = {
      id;
      name;
      description;
      price;
      isFree;
      previewImageBlobId;
      templateFileBlobId;
      features;
      createdAt = Time.now();
    };
    templates.add(id, template);
    id;
  };

  public shared ({ caller }) func updateTemplate(id : Nat, name : Text, description : Text, price : Nat, isFree : Bool, features : [Text]) : async Bool {
    let template = switch (templates.get(id)) {
      case (?t) { t };
      case (null) { Runtime.trap("Template not found") };
    };
    let updatedTemplate = {
      template with
      name;
      description;
      price;
      isFree;
      features;
    };
    templates.add(id, updatedTemplate);
    true;
  };

  public shared ({ caller }) func deleteTemplate(id : Nat) : async Bool {
    templates.remove(id);
    true;
  };

  public shared ({ caller }) func addAnnouncement(title : Text, content : Text, isPublished : Bool) : async Nat {
    if (Text.equal(title, "")) { Runtime.trap("Title must not be empty!") };
    if (Text.equal(content, "")) { Runtime.trap("Content must not be empty!") };
    let id = getNextId();
    let announcement : Announcement = {
      id;
      title;
      content;
      createdAt = Time.now();
      isPublished;
    };
    announcements.add(id, announcement);
    id;
  };

  public shared ({ caller }) func updateAnnouncement(announcement : Announcement) : async Bool {
    let existing = getAnnouncementById(announcement.id);
    let updated = {
      existing with
      title = announcement.title;
      content = announcement.content;
      isPublished = announcement.isPublished;
    };
    announcements.add(announcement.id, updated);
    true;
  };

  public shared ({ caller }) func deleteAnnouncement(id : Nat) : async Bool {
    announcements.remove(id);
    true;
  };

  public shared ({ caller }) func recordPayment(templateId : Nat, transactionRef : Text, buyerName : Text, buyerEmail : Text, buyerAddress : Text, businessDetails : Text, accountRecoveryConfirm : Bool, templateUseCase : Text) : async Bool {
    if (Text.equal(transactionRef, "")) { Runtime.trap("Transaction reference must not be empty!") };
    if (Text.equal(buyerName, "")) { Runtime.trap("Buyer name must not be empty!") };
    if (Text.equal(buyerEmail, "")) { Runtime.trap("Buyer email must not be empty!") };
    if (not buyerEmail.contains(#char '@')) {
      Runtime.trap("Invalid email address: " # buyerEmail);
    };
    // Check if buyer email is blocked
    let isBlocked = blockedBuyers.values().toArray().any(func(b) { Text.equal(b.email, buyerEmail) });
    if (isBlocked) {
      Runtime.trap("This email address has been blocked from making purchases");
    };
    let record : PaymentRecord = {
      templateId;
      transactionRef;
      caller;
      buyerName;
      buyerEmail;
      buyerAddress;
      businessDetails;
      accountRecoveryConfirm;
      templateUseCase;
      createdAt = Time.now();
    };
    paymentRecords.add(record);
    true;
  };

  public query ({ caller }) func getTemplateFileId(templateId : Nat, transactionRef : Text) : async ?Text {
    let template = getTemplateInternal(templateId);
    if (template.isFree) {
      return ?template.templateFileBlobId;
    };
    let hasPaid = paymentRecords.any(func(record) { record.templateId == templateId and record.transactionRef == transactionRef and record.caller == caller });
    if (hasPaid) {
      return ?template.templateFileBlobId;
    };
    null;
  };

  public shared ({ caller }) func addReview(templateId : Nat, reviewerName : Text, rating : Nat, comment : Text) : async Nat {
    if (Text.equal(reviewerName, "")) { Runtime.trap("Reviewer name must not be empty!") };
    let id = getNextId();
    let review : Review = {
      id;
      templateId;
      reviewerName;
      rating;
      comment;
      createdAt = Time.now();
    };
    reviews.add(id, review);
    id;
  };

  public query ({ caller }) func getReviews(templateId : Nat) : async [Review] {
    reviews.values().toArray().filter(func(r) { r.templateId == templateId });
  };

  public query ({ caller }) func getAllReviews() : async [Review] {
    reviews.values().toArray();
  };

  public shared ({ caller }) func deleteReview(id : Nat) : async Bool {
    reviews.remove(id);
    true;
  };

  public shared ({ caller }) func addPolicyDocument(docType : Text, fileName : Text, blobId : Text) : async Nat {
    let id = getNextId();
    let document : PolicyDocument = {
      id;
      docType;
      fileName;
      blobId;
      uploadedAt = Time.now();
    };
    policyDocuments.add(id, document);
    id;
  };

  public shared ({ caller }) func deletePolicyDocument(id : Nat) : async Bool {
    let _ = getDocById(id);
    policyDocuments.remove(id);
    true;
  };

  public query ({ caller }) func getPolicyDocuments() : async [PolicyDocument] {
    policyDocuments.values().toArray();
  };

  public shared ({ caller }) func blockBuyer(email : Text, reason : Text) : async Nat {
    let id = getNextId();
    let buyer : BlockedBuyer = {
      id;
      email;
      reason;
      blockedAt = Time.now();
    };
    blockedBuyers.add(id, buyer);
    id;
  };

  public shared ({ caller }) func unblockBuyer(id : Nat) : async Bool {
    switch (blockedBuyers.get(id)) {
      case (?buyer) {};
      case (null) { Runtime.trap("Buyer not found") };
    };
    blockedBuyers.remove(id);
    true;
  };

  public query ({ caller }) func getBlockedBuyers() : async [BlockedBuyer] {
    blockedBuyers.values().toArray();
  };

  public query ({ caller }) func isEmailBlocked(email : Text) : async Bool {
    blockedBuyers.values().toArray().any(func(b) { Text.equal(b.email, email) });
  };
};
