import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../widgets/security_widgets.dart';
import 'auth_screen.dart';

class SecurityScreen extends StatefulWidget {
  const SecurityScreen({super.key, required this.user});

  final User user;

  @override
  State<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends State<SecurityScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _smsCodeController = TextEditingController();

  ConfirmationResult? _phoneConfirmation;
  String? _androidVerificationId;
  bool _phoneOtpEnabled = false;
  bool _sendingPhoneOtp = false;
  bool _verifyingPhoneOtp = false;
  bool _sendingEmail = false;
  String _phoneOtpMessage =
      'Nhap so dien thoai dang E.164, vi du +84901234567.';

  @override
  void dispose() {
    _phoneController.dispose();
    _smsCodeController.dispose();
    super.dispose();
  }

  Future<void> _sendEmailVerification() async {
    final email = widget.user.email ?? 'email nay';
    setState(() => _sendingEmail = true);
    try {
      await widget.user.sendEmailVerification();
      _showSnackBar('Da gui email xac minh den $email');
    } on FirebaseAuthException catch (error) {
      if (error.code == 'too-many-requests') {
        _showSnackBar(
          'Firebase vua gui link xac minh roi. Hay kiem tra Gmail cua $email.',
        );
        return;
      }
      _showSnackBar(friendlyAuthError(error));
    } finally {
      if (mounted) {
        setState(() => _sendingEmail = false);
      }
    }
  }

  Future<void> _reloadUser() async {
    await FirebaseAuth.instance.currentUser?.reload();
    setState(() {});
    _showSnackBar('Da cap nhat trang thai tai khoan.');
  }

  Future<void> _sendPhoneOtp() async {
    final phone = _phoneController.text.trim();
    if (!phone.startsWith('+')) {
      setState(() {
        _phoneOtpMessage = 'So dien thoai phai co ma quoc gia, vi du +84...';
      });
      return;
    }

    setState(() {
      _sendingPhoneOtp = true;
      _phoneOtpMessage = 'Dang gui OTP den $phone...';
    });

    try {
      if (kIsWeb) {
        await _sendWebPhoneOtp(phone);
      } else {
        await _sendAndroidPhoneOtp(phone);
      }
    } on FirebaseAuthException catch (error) {
      setState(() => _phoneOtpMessage = friendlyAuthError(error));
    } catch (error) {
      setState(() => _phoneOtpMessage = 'Khong gui duoc OTP: $error');
    } finally {
      if (mounted) {
        setState(() => _sendingPhoneOtp = false);
      }
    }
  }

  Future<void> _sendWebPhoneOtp(String phone) async {
    final currentUser = FirebaseAuth.instance.currentUser;
    final confirmation = currentUser == null
        ? await FirebaseAuth.instance.signInWithPhoneNumber(phone)
        : await currentUser.linkWithPhoneNumber(phone);
    setState(() {
      _phoneConfirmation = confirmation;
      _androidVerificationId = null;
      _phoneOtpMessage = 'Da gui SMS OTP. Hay nhap ma vua nhan duoc.';
    });
  }

  Future<void> _sendAndroidPhoneOtp(String phone) async {
    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: phone,
      timeout: const Duration(seconds: 60),
      verificationCompleted: (credential) async {
        await FirebaseAuth.instance.currentUser?.linkWithCredential(credential);
        if (!mounted) return;
        setState(() {
          _phoneOtpEnabled = true;
          _phoneOtpMessage = 'Android da tu dong xac minh OTP.';
        });
      },
      verificationFailed: (error) {
        if (!mounted) return;
        setState(() => _phoneOtpMessage = friendlyAuthError(error));
      },
      codeSent: (verificationId, resendToken) {
        if (!mounted) return;
        setState(() {
          _androidVerificationId = verificationId;
          _phoneConfirmation = null;
          _phoneOtpMessage = 'Da gui SMS OTP. Hay nhap ma vua nhan duoc.';
        });
      },
      codeAutoRetrievalTimeout: (verificationId) {
        if (!mounted) return;
        setState(() => _androidVerificationId = verificationId);
      },
    );
  }

  Future<void> _verifyPhoneOtp() async {
    if (_phoneConfirmation == null && _androidVerificationId == null) {
      setState(() => _phoneOtpMessage = 'Hay bam gui OTP truoc.');
      return;
    }

    setState(() {
      _verifyingPhoneOtp = true;
      _phoneOtpMessage = 'Dang xac minh ma OTP...';
    });

    try {
      if (kIsWeb) {
        await _verifyWebPhoneOtp();
      } else {
        await _verifyAndroidPhoneOtp();
      }
      setState(() {
        _phoneOtpEnabled = true;
        _phoneOtpMessage = 'OTP dung. So dien thoai da duoc xac minh.';
      });
    } on FirebaseAuthException catch (error) {
      setState(() => _phoneOtpMessage = friendlyAuthError(error));
    } catch (error) {
      setState(() => _phoneOtpMessage = 'Khong xac minh duoc OTP: $error');
    } finally {
      if (mounted) {
        setState(() => _verifyingPhoneOtp = false);
      }
    }
  }

  Future<void> _verifyWebPhoneOtp() async {
    try {
      await _phoneConfirmation!.confirm(_smsCodeController.text.trim());
    } on FirebaseAuthException catch (error) {
      if (error.code == 'credential-already-in-use' ||
          error.code == 'email-already-in-use' ||
          error.code == 'account-exists-with-different-credential') {
        throw FirebaseAuthException(
          code: error.code,
          message:
              'So dien thoai nay da duoc gan voi tai khoan khac. Hay xoa user so dien thoai trong Firebase Console hoac dung so test khac.',
        );
      }
      rethrow;
    }
    await FirebaseAuth.instance.currentUser?.reload();
  }

  Future<void> _verifyAndroidPhoneOtp() async {
    final credential = PhoneAuthProvider.credential(
      verificationId: _androidVerificationId!,
      smsCode: _smsCodeController.text.trim(),
    );

    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      await FirebaseAuth.instance.signInWithCredential(credential);
      return;
    }

    try {
      await currentUser.linkWithCredential(credential);
    } on FirebaseAuthException catch (error) {
      if (error.code == 'provider-already-linked' ||
          error.code == 'credential-already-in-use') {
        await FirebaseAuth.instance.signInWithCredential(credential);
        return;
      }
      rethrow;
    }
  }

  Future<void> _signOut() async {
    await FirebaseAuth.instance.signOut();
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser ?? widget.user;
    final email = user.email ?? 'Chua co email';
    final emailVerified = user.emailVerified;
    final completedSteps = [
      true,
      emailVerified,
      _phoneOtpEnabled,
    ].where((step) => step).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('4. Bao mat tai khoan'),
        centerTitle: false,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        actions: [
          IconButton(
            tooltip: 'Dang xuat',
            onPressed: _signOut,
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            AccountSummaryCard(
              email: email,
              completedSteps: completedSteps,
              totalSteps: 3,
            ),
            const SizedBox(height: 16),
            SecurityStepCard(
              step: '1',
              title: 'Dang nhap bang Firebase',
              subtitle:
                  'Tai khoan hien tai da duoc xac thuc bang Firebase Auth.',
              done: true,
              child: Text(
                email,
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: 16),
            SecurityStepCard(
              step: '2',
              title: 'Xac minh email',
              subtitle: emailVerified
                  ? 'Email da duoc Firebase xac minh.'
                  : 'Gui email xac minh, bam link trong Gmail, sau do cap nhat lai.',
              done: emailVerified,
              child: EmailSecurityCard(
                verified: emailVerified,
                loading: _sendingEmail,
                onVerify: _sendEmailVerification,
                onReload: _reloadUser,
              ),
            ),
            const SizedBox(height: 16),
            SecurityStepCard(
              step: '3',
              title: 'Xac minh Phone OTP',
              subtitle: _phoneOtpEnabled
                  ? 'So dien thoai da duoc xac minh bang OTP.'
                  : 'Gui OTP qua Firebase Phone Auth roi nhap ma de xac minh.',
              done: _phoneOtpEnabled,
              child: PhoneOtpCard(
                phoneController: _phoneController,
                codeController: _smsCodeController,
                enabled: _phoneOtpEnabled,
                sending: _sendingPhoneOtp,
                verifying: _verifyingPhoneOtp,
                message: _phoneOtpMessage,
                onSend: _sendPhoneOtp,
                onVerify: _verifyPhoneOtp,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
