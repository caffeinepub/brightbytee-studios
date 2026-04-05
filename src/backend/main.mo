import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";


actor {
  // caller field kept for migration compatibility with existing stored records
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

  type OrderStatus = { #pending; #approved; #rejected };

  type Order = {
    id : Nat;
    templateId : Nat;
    transactionRef : Text;
    screenshotBlobId : Text;
    buyerName : Text;
    buyerEmail : Text;
    buyerMobile : Text;
    buyerAddress : Text;
    businessDetails : Text;
    accountRecovery : Bool;
    templateUseCase : Text;
    status : OrderStatus;
    createdAt : Int;
  };

  type CountryCount = {
    country : Text;
    count : Nat;
  };

  module Template {
    public func compare(a : Template, b : Template) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  let templates = Map.empty<Nat, Template>();
  let announcements = Map.empty<Nat, Announcement>();
  let paymentRecords = List.empty<PaymentRecord>();
  let reviews = Map.empty<Nat, Review>();
  let policyDocuments = Map.empty<Nat, PolicyDocument>();
  let blockedBuyers = Map.empty<Nat, BlockedBuyer>();
  let orders = Map.empty<Nat, Order>();
  let countryCounts = Map.empty<Text, Nat>();

  var nextId = 0;
  var pageVisitCount : Nat = 0;

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

  public query func getTemplates() : async [Template] {
    templates.values().toArray().filter(func(t) { not t.isFree }).sort();
  };

  public query func getFreeTemplates() : async [Template] {
    templates.values().toArray().filter(func(t) { t.isFree }).sort();
  };

  public query func getAnnouncements() : async [Announcement] {
    announcements.values().toArray().filter(func(a) { a.isPublished });
  };

  public shared func addTemplate(name : Text, description : Text, price : Nat, isFree : Bool, previewImageBlobId : Text, templateFileBlobId : Text, features : [Text]) : async Nat {
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

  public shared func updateTemplate(id : Nat, name : Text, description : Text, price : Nat, isFree : Bool, features : [Text]) : async Bool {
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

  public shared func deleteTemplate(id : Nat) : async Bool {
    templates.remove(id);
    true;
  };

  public shared func addAnnouncement(title : Text, content : Text, isPublished : Bool) : async Nat {
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

  public shared func updateAnnouncement(announcement : Announcement) : async Bool {
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

  public shared func deleteAnnouncement(id : Nat) : async Bool {
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

  public query func getTemplateFileId(templateId : Nat, transactionRef : Text) : async ?Text {
    let template = getTemplateInternal(templateId);
    if (template.isFree) {
      return ?template.templateFileBlobId;
    };
    let hasPaid = paymentRecords.any(func(r) { r.templateId == templateId and Text.equal(r.transactionRef, transactionRef) });
    if (hasPaid) {
      return ?template.templateFileBlobId;
    };
    null;
  };

  public shared func addReview(templateId : Nat, reviewerName : Text, rating : Nat, comment : Text) : async Nat {
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

  public query func getReviews(templateId : Nat) : async [Review] {
    reviews.values().toArray().filter(func(r) { r.templateId == templateId });
  };

  public query func getAllReviews() : async [Review] {
    reviews.values().toArray();
  };

  public shared func deleteReview(id : Nat) : async Bool {
    reviews.remove(id);
    true;
  };

  public shared func addPolicyDocument(docType : Text, fileName : Text, blobId : Text) : async Nat {
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

  public shared func deletePolicyDocument(id : Nat) : async Bool {
    let _ = getDocById(id);
    policyDocuments.remove(id);
    true;
  };

  public query func getPolicyDocuments() : async [PolicyDocument] {
    policyDocuments.values().toArray();
  };

  public shared func blockBuyer(email : Text, reason : Text) : async Nat {
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

  public shared func unblockBuyer(id : Nat) : async Bool {
    switch (blockedBuyers.get(id)) {
      case (?_) {};
      case (null) { Runtime.trap("Buyer not found") };
    };
    blockedBuyers.remove(id);
    true;
  };

  public query func getBlockedBuyers() : async [BlockedBuyer] {
    blockedBuyers.values().toArray();
  };

  public query func isEmailBlocked(email : Text) : async Bool {
    blockedBuyers.values().toArray().any(func(b) { Text.equal(b.email, email) });
  };

  // --- Orders ---

  public shared func submitOrder(
    templateId : Nat,
    transactionRef : Text,
    screenshotBlobId : Text,
    buyerName : Text,
    buyerEmail : Text,
    buyerMobile : Text,
    buyerAddress : Text,
    businessDetails : Text,
    accountRecovery : Bool,
    templateUseCase : Text
  ) : async Nat {
    if (Text.equal(buyerEmail, "")) { Runtime.trap("Buyer email must not be empty!") };
    if (Text.equal(transactionRef, "")) { Runtime.trap("Transaction reference must not be empty!") };
    let isBlocked = blockedBuyers.values().toArray().any(func(b) { Text.equal(b.email, buyerEmail) });
    if (isBlocked) {
      Runtime.trap("This email address has been blocked from making purchases");
    };
    let id = getNextId();
    let order : Order = {
      id;
      templateId;
      transactionRef;
      screenshotBlobId;
      buyerName;
      buyerEmail;
      buyerMobile;
      buyerAddress;
      businessDetails;
      accountRecovery;
      templateUseCase;
      status = #pending;
      createdAt = Time.now();
    };
    orders.add(id, order);
    id;
  };

  public query func getOrders() : async [Order] {
    orders.values().toArray();
  };

  public shared func approveOrder(orderId : Nat) : async Bool {
    switch (orders.get(orderId)) {
      case (?o) {
        let updated = { o with status = #approved };
        orders.add(orderId, updated);
        true;
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  public shared func rejectOrder(orderId : Nat) : async Bool {
    switch (orders.get(orderId)) {
      case (?o) {
        let updated = { o with status = #rejected };
        orders.add(orderId, updated);
        true;
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  public query func getOrdersByEmail(email : Text) : async [Order] {
    orders.values().toArray().filter(func(o) { Text.equal(o.buyerEmail, email) });
  };

  public query func getApprovedOrderFileId(orderId : Nat) : async ?Text {
    switch (orders.get(orderId)) {
      case (?o) {
        switch (o.status) {
          case (#approved) {
            let template = getTemplateInternal(o.templateId);
            ?template.templateFileBlobId;
          };
          case (_) { null };
        };
      };
      case (null) { null };
    };
  };

  // --- Analytics ---

  public shared func recordPageVisit(country : Text) : async () {
    pageVisitCount += 1;
    if (not Text.equal(country, "")) {
      let current = switch (countryCounts.get(country)) {
        case (?c) { c };
        case (null) { 0 };
      };
      countryCounts.add(country, current + 1);
    };
  };

  public query func getPageVisitCount() : async Nat {
    pageVisitCount;
  };

  public query func getVisitorCountries() : async [CountryCount] {
    countryCounts.entries().map(func((country, count) : (Text, Nat)) : CountryCount { { country; count } }).toArray();
  };

  public query func getPaymentSummary() : async { totalOrders : Nat; pendingOrders : Nat; approvedOrders : Nat; rejectedOrders : Nat } {
    let allOrders = orders.values().toArray();
    let total = allOrders.size();
    let pending = allOrders.filter(func(o) { switch (o.status) { case (#pending) { true }; case (_) { false } } }).size();
    let approved = allOrders.filter(func(o) { switch (o.status) { case (#approved) { true }; case (_) { false } } }).size();
    let rejected = allOrders.filter(func(o) { switch (o.status) { case (#rejected) { true }; case (_) { false } } }).size();
    { totalOrders = total; pendingOrders = pending; approvedOrders = approved; rejectedOrders = rejected };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();
};
