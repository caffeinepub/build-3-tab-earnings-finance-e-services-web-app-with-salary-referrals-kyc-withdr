import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

actor {
  include MixinStorage();

  type TaskType = {
    #tapTapTask;
    #watchYouTubeVideo;
    #followSocialMedia;
    #aiPhotoEdit;
    #aiVideoEdit;
  };

  type Task = {
    id : Text;
    title : Text;
    description : Text;
    taskType : TaskType;
    rewardCents : Nat;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Text.compare(task1.id, task2.id);
    };
  };

  type TaskCompletion = {
    taskId : Text;
    completionTime : Int;
    rewardCents : Nat;
  };

  type Referral = {
    referrer : Principal;
    referee : Principal;
    timestamp : Int;
  };

  type VerificationStatus = {
    emailVerified : Bool;
    nidVerified : Bool;
    bankAccountVerified : Bool;
  };

  type EServiceType = {
    #landServices;
    #passport;
    #nidCopy;
    #visa;
    #mobileRecharge;
  };

  type EServiceRequest = {
    id : Text;
    user : Principal;
    serviceType : EServiceType;
    status : { #pending; #approved; #rejected };
    requestDetails : Text;
  };

  type MicroLoanRequest = {
    id : Text;
    user : Principal;
    amountCents : Nat;
    status : { #pending; #approved; #rejected };
    purpose : Text;
    repaymentMonths : Nat;
    monthlyPaymentCents : Nat;
    verificationStatus : VerificationStatus;
  };

  type DPSRequest = {
    id : Text;
    user : Principal;
    amountCents : Nat;
    termMonths : Nat;
    status : { #pending; #approved; #rejected };
    purpose : Text;
    verificationStatus : VerificationStatus;
  };

  type WithdrawMethod = {
    #bank : {
      bankName : Text;
      branch : Text;
      accountHolderName : Text;
      accountNumber : Text;
      routingNumber : Text;
    };
    #mobile : {
      provider : Text;
      accountNumber : Text;
    };
    #global : {
      provider : Text;
      accountNumber : Text;
    };
    #cash;
  };

  type CardType = { #visa; #mastercard };

  type WithdrawRequest = {
    id : Text;
    user : Principal;
    amountCents : Nat;
    method : WithdrawMethod;
    status : { #pending; #approved; #rejected };
    comment : ?Text;
    requestedAt : Int;
    verificationStatus : VerificationStatus;
  };

  type FinancialRecord = {
    recordId : Text;
    user : Principal;
    amountCents : Int;
    recordType : {
      #withdrawal : WithdrawRequest;
      #loan : MicroLoanRequest;
      #dps : DPSRequest;
    };
    timestamp : Int;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    location : Text;
    verificationStatus : VerificationStatus;
    avatar : ?Storage.ExternalBlob;
    profileScore : Nat;
  };

  type SensitiveDocument = {
    id : Text;
    user : Principal;
    documentType : Text;
    documentContent : Storage.ExternalBlob;
    verified : Bool;
  };

  type UserBan = {
    user : Principal;
    reason : Text;
    issuedBy : Principal;
    timestamp : Int;
    banType : { #permanent; #temporary : Int };
  };

  type TapToEarnState = {
    coinBalance : Nat;
    tapCount : Nat;
  };

  // State storage
  let accounts = Map.empty<Principal, Nat>();
  let savedProfiles = Map.empty<Principal, UserProfile>();
  let banStatus = Map.empty<Principal, UserBan>();
  let oneTimeFees = Map.empty<Principal, Nat>();
  let financialRecords = Map.empty<Principal, [FinancialRecord]>();
  let savedLinks = Map.empty<Text, Text>();
  let completedTasks = Map.empty<Principal, [TaskCompletion]>();
  let fines = Map.empty<Principal, Nat>();
  let taskCatalog = Map.empty<Text, Task>();
  let referrals = Map.empty<Principal, [Referral]>();
  let referralCodes = Map.empty<Principal, Text>();
  let sensitiveDocuments = Map.empty<Text, SensitiveDocument>();
  let financialGoals = Map.empty<Principal, [FinancialRecord]>();
  let validPromoCodes = Map.empty<Text, Nat>();
  let planFeatures = Map.empty<Text, Nat>();
  let withdrawalRequests = Map.empty<Principal, [WithdrawRequest]>();
  let microLoanRequests = Map.empty<Principal, [MicroLoanRequest]>();
  let dpsRequests = Map.empty<Principal, [DPSRequest]>();
  let eServiceRequests = Map.empty<Principal, [EServiceRequest]>();
  let userRecords = Map.empty<Principal, [FinancialRecord]>();
  let tapToEarnStates = Map.empty<Principal, TapToEarnState>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to check if user is banned
  private func checkUserNotBanned(user : Principal) {
    switch (banStatus.get(user)) {
      case (?ban) {
        Runtime.trap("User is banned: " # ban.reason);
      };
      case (null) {};
    };
  };

  // ===== TAP-TO-EARN FUNCTIONS =====

  public query ({ caller }) func getTapToEarnState() : async TapToEarnState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tap-to-earn state");
    };

    switch (tapToEarnStates.get(caller)) {
      case (?state) { state };
      case (null) {
        {
          coinBalance = 0;
          tapCount = 0;
        };
      };
    };
  };

  public shared ({ caller }) func registerTap(_ : ()) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can tap to earn");
    };
    checkUserNotBanned(caller);

    let currentState = switch (tapToEarnStates.get(caller)) {
      case (?state) { state };
      case (null) {
        {
          coinBalance = 0;
          tapCount = 0;
        };
      };
    };

    let newState = {
      coinBalance = currentState.coinBalance + 1;
      tapCount = currentState.tapCount + 1;
    };

    tapToEarnStates.add(caller, newState);
  };

  public shared ({ caller }) func registerTaps(tapCount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can tap to earn");
    };
    checkUserNotBanned(caller);

    if (tapCount == 0) {
      Runtime.trap("Cannot register zero taps");
    };

    if (tapCount > 1000) {
      Runtime.trap("Cannot register more than 1000 taps at once");
    };

    let currentState = switch (tapToEarnStates.get(caller)) {
      case (?state) { state };
      case (null) {
        {
          coinBalance = 0;
          tapCount = 0;
        };
      };
    };

    let newState = {
      coinBalance = currentState.coinBalance + tapCount;
      tapCount = currentState.tapCount + tapCount;
    };

    tapToEarnStates.add(caller, newState);
  };

  public shared ({ caller }) func resetTapCount(_ : ()) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset tap count");
    };
    checkUserNotBanned(caller);

    let currentState = switch (tapToEarnStates.get(caller)) {
      case (?state) { state };
      case (null) {
        {
          coinBalance = 0;
          tapCount = 0;
        };
      };
    };

    tapToEarnStates.add(
      caller,
      {
        coinBalance = currentState.coinBalance;
        tapCount = 0;
      },
    );
  };

  public shared ({ caller }) func claimTapToEarnCoins(_ : ()) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim tap-to-earn coins");
    };
    checkUserNotBanned(caller);

    let state = switch (tapToEarnStates.get(caller)) {
      case (?state) { state };
      case (null) {
        {
          coinBalance = 0;
          tapCount = 0;
        };
      };
    };

    let coinsToAdd = state.coinBalance;

    // Update user's account balance
    let currentBalance = switch (accounts.get(caller)) {
      case (?balance) { balance };
      case (null) { 0 };
    };
    accounts.add(caller, currentBalance + coinsToAdd);

    // Reset tap-to-earn balance and counters
    tapToEarnStates.add(
      caller,
      {
        coinBalance = 0;
        tapCount = 0;
      },
    );

    coinsToAdd;
  };

  // ===== USER PROFILE FUNCTIONS (Required by frontend) =====

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    savedProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin access required");
    };
    savedProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    checkUserNotBanned(caller);
    savedProfiles.add(caller, profile);
  };

  // ===== TASK CATALOG & COMPLETION =====

  public query ({ caller }) func getTaskCatalog() : async [Task] {
    // Anyone can view task catalog (including guests)
    taskCatalog.values().toArray();
  };

  public shared ({ caller }) func startTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start tasks");
    };
    checkUserNotBanned(caller);

    switch (taskCatalog.get(taskId)) {
      case (?_task) {
        // Task started - implementation would track start time
      };
      case (null) {
        Runtime.trap("Task not found");
      };
    };
  };

  public shared ({ caller }) func submitTaskCompletion(taskId : Text, proof : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit task completions");
    };
    checkUserNotBanned(caller);

    switch (taskCatalog.get(taskId)) {
      case (?task) {
        let completion : TaskCompletion = {
          taskId = taskId;
          completionTime = Time.now();
          rewardCents = task.rewardCents;
        };

        let userCompletions = switch (completedTasks.get(caller)) {
          case (?existing) { existing };
          case (null) { [] };
        };

        completedTasks.add(caller, userCompletions.concat([completion]));

        // Update account balance
        let currentBalance = switch (accounts.get(caller)) {
          case (?balance) { balance };
          case (null) { 0 };
        };
        accounts.add(caller, currentBalance + task.rewardCents);
      };
      case (null) {
        Runtime.trap("Task not found");
      };
    };
  };

  public query ({ caller }) func getMyCompletedTasks() : async [TaskCompletion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their completed tasks");
    };

    switch (completedTasks.get(caller)) {
      case (?tasks) { tasks };
      case (null) { [] };
    };
  };

  // ===== REFERRAL SYSTEM =====

  public query ({ caller }) func getMyReferralCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get referral codes");
    };

    switch (referralCodes.get(caller)) {
      case (?code) { code };
      case (null) {
        // Generate code based on principal
        caller.toText();
      };
    };
  };

  public shared ({ caller }) func registerReferral(referrerCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register referrals");
    };
    checkUserNotBanned(caller);

    // Find referrer by code
    var referrerPrincipal : ?Principal = null;
    for ((principal, code) in referralCodes.entries()) {
      if (code == referrerCode) {
        referrerPrincipal := ?principal;
      };
    };

    switch (referrerPrincipal) {
      case (?referrer) {
        // Prevent self-referral
        if (referrer == caller) {
          Runtime.trap("Cannot refer yourself");
        };

        // Check for duplicate referral
        let existingReferrals = switch (referrals.get(referrer)) {
          case (?refs) { refs };
          case (null) { [] };
        };

        for (ref in existingReferrals.vals()) {
          if (ref.referee == caller) {
            Runtime.trap("Referral already registered");
          };
        };

        // Add referral
        let newReferral : Referral = {
          referrer = referrer;
          referee = caller;
          timestamp = Time.now();
        };

        referrals.add(referrer, existingReferrals.concat([newReferral]));
      };
      case (null) {
        Runtime.trap("Invalid referral code");
      };
    };
  };

  public query ({ caller }) func getMyReferrals() : async [Referral] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their referrals");
    };

    switch (referrals.get(caller)) {
      case (?refs) { refs };
      case (null) { [] };
    };
  };

  public query ({ caller }) func calculateReferralBonus() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate referral bonus");
    };

    let userReferrals = switch (referrals.get(caller)) {
      case (?refs) { refs };
      case (null) { [] };
    };

    let referralCount = userReferrals.size();
    let bonusMultiplier = referralCount / 100;
    bonusMultiplier * 10; // 10% per 100 referrals
  };

  // ===== EARNINGS & BALANCE =====

  public query ({ caller }) func getMyBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their balance");
    };

    switch (accounts.get(caller)) {
      case (?balance) { balance };
      case (null) { 0 };
    };
  };

  // ===== WITHDRAWAL REQUESTS =====

  public shared ({ caller }) func requestWithdrawal(amountCents : Nat, method : WithdrawMethod) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request withdrawals");
    };
    checkUserNotBanned(caller);

    let currentBalance = switch (accounts.get(caller)) {
      case (?balance) { balance };
      case (null) { 0 };
    };

    if (amountCents > currentBalance) {
      Runtime.trap("Insufficient balance");
    };

    let profile = switch (savedProfiles.get(caller)) {
      case (?p) { p };
      case (null) {
        Runtime.trap("Profile not found");
      };
    };

    let requestId = caller.toText() # "-" # Time.now().toText();
    let request : WithdrawRequest = {
      id = requestId;
      user = caller;
      amountCents = amountCents;
      method = method;
      status = #pending;
      comment = null;
      requestedAt = Time.now();
      verificationStatus = profile.verificationStatus;
    };

    let userRequests = switch (withdrawalRequests.get(caller)) {
      case (?existing) { existing };
      case (null) { [] };
    };

    withdrawalRequests.add(caller, userRequests.concat([request]));
    requestId;
  };

  public query ({ caller }) func getMyWithdrawalRequests() : async [WithdrawRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their withdrawal requests");
    };

    switch (withdrawalRequests.get(caller)) {
      case (?requests) { requests };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func approveWithdrawal(user : Principal, requestId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };

    let userRequests = switch (withdrawalRequests.get(user)) {
      case (?requests) { requests };
      case (null) {
        Runtime.trap("No withdrawal requests found for user");
      };
    };

    let updatedRequests = userRequests.map(
      func(req) {
        if (req.id == requestId) {
          {
            id = req.id;
            user = req.user;
            amountCents = req.amountCents;
            method = req.method;
            status = #approved;
            comment = req.comment;
            requestedAt = req.requestedAt;
            verificationStatus = req.verificationStatus;
          };
        } else {
          req;
        };
      },
    );

    withdrawalRequests.add(user, updatedRequests);
  };

  // ===== MICRO LOAN REQUESTS =====

  public shared ({ caller }) func requestMicroLoan(
    amountCents : Nat,
    purpose : Text,
    repaymentMonths : Nat,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request micro loans");
    };
    checkUserNotBanned(caller);

    let profile = switch (savedProfiles.get(caller)) {
      case (?p) { p };
      case (null) {
        Runtime.trap("Profile not found");
      };
    };

    let requestId = caller.toText() # "-loan-" # Time.now().toText();
    let monthlyPayment = amountCents / repaymentMonths;

    let request : MicroLoanRequest = {
      id = requestId;
      user = caller;
      amountCents = amountCents;
      status = #pending;
      purpose = purpose;
      repaymentMonths = repaymentMonths;
      monthlyPaymentCents = monthlyPayment;
      verificationStatus = profile.verificationStatus;
    };

    let userRequests = switch (microLoanRequests.get(caller)) {
      case (?existing) { existing };
      case (null) { [] };
    };

    microLoanRequests.add(caller, userRequests.concat([request]));
    requestId;
  };

  public query ({ caller }) func getMyMicroLoanRequests() : async [MicroLoanRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their loan requests");
    };

    switch (microLoanRequests.get(caller)) {
      case (?requests) { requests };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func approveMicroLoan(user : Principal, requestId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve loans");
    };

    let userRequests = switch (microLoanRequests.get(user)) {
      case (?requests) { requests };
      case (null) {
        Runtime.trap("No loan requests found for user");
      };
    };

    let updatedRequests = userRequests.map(
      func(req) {
        if (req.id == requestId) {
          {
            id = req.id;
            user = req.user;
            amountCents = req.amountCents;
            status = #approved;
            purpose = req.purpose;
            repaymentMonths = req.repaymentMonths;
            monthlyPaymentCents = req.monthlyPaymentCents;
            verificationStatus = req.verificationStatus;
          };
        } else {
          req;
        };
      },
    );

    microLoanRequests.add(user, updatedRequests);
  };

  // ===== DPS REQUESTS =====

  public shared ({ caller }) func requestDPS(
    amountCents : Nat,
    termMonths : Nat,
    purpose : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request DPS");
    };
    checkUserNotBanned(caller);

    let profile = switch (savedProfiles.get(caller)) {
      case (?p) { p };
      case (null) {
        Runtime.trap("Profile not found");
      };
    };

    let requestId = caller.toText() # "-dps-" # Time.now().toText();

    let request : DPSRequest = {
      id = requestId;
      user = caller;
      amountCents = amountCents;
      termMonths = termMonths;
      status = #pending;
      purpose = purpose;
      verificationStatus = profile.verificationStatus;
    };

    let userRequests = switch (dpsRequests.get(caller)) {
      case (?existing) { existing };
      case (null) { [] };
    };

    dpsRequests.add(caller, userRequests.concat([request]));
    requestId;
  };

  public query ({ caller }) func getMyDPSRequests() : async [DPSRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their DPS requests");
    };

    switch (dpsRequests.get(caller)) {
      case (?requests) { requests };
      case (null) { [] };
    };
  };

  // ===== E-SERVICE REQUESTS =====

  public shared ({ caller }) func requestEService(
    serviceType : EServiceType,
    requestDetails : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request e-services");
    };
    checkUserNotBanned(caller);

    let requestId = caller.toText() # "-eservice-" # Time.now().toText();

    let request : EServiceRequest = {
      id = requestId;
      user = caller;
      serviceType = serviceType;
      status = #pending;
      requestDetails = requestDetails;
    };

    let userRequests = switch (eServiceRequests.get(caller)) {
      case (?existing) { existing };
      case (null) { [] };
    };

    eServiceRequests.add(caller, userRequests.concat([request]));
    requestId;
  };

  public query ({ caller }) func getMyEServiceRequests() : async [EServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their e-service requests");
    };

    switch (eServiceRequests.get(caller)) {
      case (?requests) { requests };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func approveEServiceRequest(user : Principal, requestId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve e-service requests");
    };

    let userRequests = switch (eServiceRequests.get(user)) {
      case (?requests) { requests };
      case (null) {
        Runtime.trap("No e-service requests found for user");
      };
    };

    let updatedRequests = userRequests.map(
      func(req) {
        if (req.id == requestId) {
          {
            id = req.id;
            user = req.user;
            serviceType = req.serviceType;
            status = #approved;
            requestDetails = req.requestDetails;
          };
        } else {
          req;
        };
      },
    );

    eServiceRequests.add(user, updatedRequests);
  };

  // ===== SENSITIVE DOCUMENTS =====

  public shared ({ caller }) func uploadSensitiveDocument(
    documentType : Text,
    encryptedContent : Storage.ExternalBlob,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload documents");
    };
    checkUserNotBanned(caller);

    let docId = caller.toText() # "-doc-" # Time.now().toText();

    let document : SensitiveDocument = {
      id = docId;
      user = caller;
      documentType = documentType;
      documentContent = encryptedContent;
      verified = false;
    };

    sensitiveDocuments.add(docId, document);
    docId;
  };

  public query ({ caller }) func getMyDocuments() : async [(Text, Text, Bool)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their documents");
    };

    let userDocs = sensitiveDocuments.entries().toArray().filter(
      func((_, doc)) { doc.user == caller },
    );

    userDocs.map<(Text, SensitiveDocument), (Text, Text, Bool)>(
      func((id, doc)) { (id, doc.documentType, doc.verified) },
    );
  };

  public shared ({ caller }) func verifyDocument(docId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can verify documents");
    };

    switch (sensitiveDocuments.get(docId)) {
      case (?doc) {
        let verifiedDoc : SensitiveDocument = {
          id = doc.id;
          user = doc.user;
          documentType = doc.documentType;
          documentContent = doc.documentContent;
          verified = true;
        };
        sensitiveDocuments.add(docId, verifiedDoc);

        // Update user profile verification status
        switch (savedProfiles.get(doc.user)) {
          case (?profile) {
            let updatedProfile : UserProfile = {
              name = profile.name;
              email = profile.email;
              phone = profile.phone;
              location = profile.location;
              verificationStatus = {
                emailVerified = profile.verificationStatus.emailVerified;
                nidVerified = true;
                bankAccountVerified = profile.verificationStatus.bankAccountVerified;
              };
              avatar = profile.avatar;
              profileScore = profile.profileScore;
            };
            savedProfiles.add(doc.user, updatedProfile);
          };
          case (null) {};
        };
      };
      case (null) {
        Runtime.trap("Document not found");
      };
    };
  };

  // ===== BAN MANAGEMENT =====

  public shared ({ caller }) func banUser(
    user : Principal,
    reason : Text,
    banType : { #permanent; #temporary : Int },
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };

    let ban : UserBan = {
      user = user;
      reason = reason;
      issuedBy = caller;
      timestamp = Time.now();
      banType = banType;
    };

    banStatus.add(user, ban);

    // Forfeit earnings per policy
    accounts.add(user, 0);
  };

  public shared ({ caller }) func unbanUser(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };

    banStatus.remove(user);
  };

  public query ({ caller }) func isUserBanned(user : Principal) : async Bool {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own ban status or admin access required");
    };

    switch (banStatus.get(user)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  public query ({ caller }) func getBanStatus(user : Principal) : async ?UserBan {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own ban status or admin access required");
    };

    banStatus.get(user);
  };

  // ===== ADMIN FUNCTIONS =====

  public query ({ caller }) func getAllWithdrawalRequests() : async [(Principal, [WithdrawRequest])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all withdrawal requests");
    };

    withdrawalRequests.entries().toArray();
  };

  public query ({ caller }) func getAllMicroLoanRequests() : async [(Principal, [MicroLoanRequest])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all loan requests");
    };

    microLoanRequests.entries().toArray();
  };

  public query ({ caller }) func getAllEServiceRequests() : async [(Principal, [EServiceRequest])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all e-service requests");
    };

    eServiceRequests.entries().toArray();
  };

  public shared ({ caller }) func addTaskToCatalog(task : Task) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add tasks");
    };

    taskCatalog.add(task.id, task);
  };

  public shared ({ caller }) func removeTaskFromCatalog(taskId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can remove tasks");
    };

    taskCatalog.remove(taskId);
  };
};
