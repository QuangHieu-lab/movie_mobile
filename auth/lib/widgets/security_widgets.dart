import 'package:flutter/material.dart';

class SecurityPanel extends StatelessWidget {
  const SecurityPanel({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: child,
    );
  }
}

class AccountSummaryCard extends StatelessWidget {
  const AccountSummaryCard({
    super.key,
    required this.email,
    required this.completedSteps,
    required this.totalSteps,
  });

  final String email;
  final int completedSteps;
  final int totalSteps;

  @override
  Widget build(BuildContext context) {
    final progress = completedSteps / totalSteps;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF123C69),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.verified_user_rounded,
                color: Color(0xFF5EEAD4),
                size: 32,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  email,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            '$completedSteps/$totalSteps buoc bao mat da hoan thanh',
            style: const TextStyle(
              color: Color(0xFFE6EEF7),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 10,
              backgroundColor: Colors.white24,
              color: const Color(0xFF5EEAD4),
            ),
          ),
        ],
      ),
    );
  }
}

class SecurityStepCard extends StatelessWidget {
  const SecurityStepCard({
    super.key,
    required this.step,
    required this.title,
    required this.subtitle,
    required this.done,
    required this.child,
  });

  final String step;
  final String title;
  final String subtitle;
  final bool done;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SecurityPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: done
                    ? const Color(0xFFDCFCE7)
                    : const Color(0xFFFFEDD5),
                child: done
                    ? const Icon(Icons.check_rounded, color: Color(0xFF16A34A))
                    : Text(
                        step,
                        style: const TextStyle(
                          color: Color(0xFFC2410C),
                          fontWeight: FontWeight.w800,
                        ),
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(subtitle),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class EmailSecurityCard extends StatelessWidget {
  const EmailSecurityCard({
    super.key,
    required this.verified,
    required this.loading,
    required this.onVerify,
    required this.onReload,
  });

  final bool verified;
  final bool loading;
  final VoidCallback onVerify;
  final VoidCallback onReload;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: FilledButton.icon(
            onPressed: verified || loading ? null : onVerify,
            icon: loading
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Icon(verified ? Icons.verified_rounded : Icons.send),
            label: Text(
              verified
                  ? 'Email da xac minh'
                  : loading
                  ? 'Dang gui...'
                  : 'Gui email xac minh',
            ),
          ),
        ),
        const SizedBox(width: 8),
        IconButton.filledTonal(
          tooltip: 'Cap nhat trang thai',
          onPressed: onReload,
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
    );
  }
}

class PhoneOtpCard extends StatelessWidget {
  const PhoneOtpCard({
    super.key,
    required this.phoneController,
    required this.codeController,
    required this.enabled,
    required this.sending,
    required this.verifying,
    required this.message,
    required this.onSend,
    required this.onVerify,
  });

  final TextEditingController phoneController;
  final TextEditingController codeController;
  final bool enabled;
  final bool sending;
  final bool verifying;
  final String message;
  final VoidCallback onSend;
  final VoidCallback onVerify;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: phoneController,
          enabled: !enabled && !sending && !verifying,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            hintText: '+84976693436',
            labelText: 'So dien thoai',
            prefixIcon: Icon(Icons.phone_rounded),
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 10),
        FilledButton.icon(
          onPressed: enabled || sending || verifying ? null : onSend,
          icon: sending
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.sms_rounded),
          label: Text(sending ? 'Dang gui OTP...' : 'Gui OTP'),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: codeController,
          enabled: !enabled && !verifying,
          maxLength: 6,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            counterText: '',
            hintText: 'Nhap ma OTP',
            helperText: message,
            prefixIcon: const Icon(Icons.pin_rounded),
            border: const OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 10),
        FilledButton.icon(
          onPressed: enabled || verifying ? null : onVerify,
          icon: verifying
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.shield_rounded),
          label: Text(
            enabled
                ? 'OTP da xac minh'
                : verifying
                ? 'Dang xac minh...'
                : 'Xac nhan OTP',
          ),
        ),
      ],
    );
  }
}
