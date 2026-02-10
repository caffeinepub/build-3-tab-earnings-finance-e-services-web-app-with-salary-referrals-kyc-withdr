import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  type OldTapToEarnState = {
    coinBalance : Nat;
    tapCount : Nat;
  };

  type OldActor = {
    tapToEarnStates : Map.Map<Principal, OldTapToEarnState>;
  };

  type NewTapToEarnState = {
    coinBalance : Nat;
    tapCount : Nat;
    remainderTaps : Nat;
  };

  type NewActor = {
    tapToEarnStates : Map.Map<Principal, NewTapToEarnState>;
  };

  public func run(old : OldActor) : NewActor {
    let newTapToEarnStates = old.tapToEarnStates.map<Principal, OldTapToEarnState, NewTapToEarnState>(
      func(_p, oldState) {
        {
          coinBalance = oldState.coinBalance;
          tapCount = oldState.tapCount;
          remainderTaps = 0;
        };
      }
    );
    { tapToEarnStates = newTapToEarnStates };
  };
};
